const fs = require('fs')
const path = require('path')
const psl = require('psl')
const archiver = require('archiver')
const glob = require('glob')
const ignore = require('ignore')
const colors = require('ansi-colors')
const ora = require('ora')
const CloudFormation = require('aws-sdk/clients/cloudformation')
const S3 = require('aws-sdk/clients/s3')
const Lambda = require('aws-sdk/clients/lambda')
const ACM = require('aws-sdk/clients/acm')

module.exports = async ({
  hostname,
  region = 'eu-west-1',
  projectPath
} = {}) => {
  if (!hostname) {
    throw new Error('Please provide a deployment hostname')
  }

  const { domain, subdomain } = psl.parse(hostname)

  const certificateDomain = subdomain ? `*.${domain}` : domain

  const acm = new ACM({
    region: 'us-east-1'
  })

  let certificateArn

  const existingCertificateSpinner = ora(`Getting existing certificate for ${certificateDomain}`).start()

  const certificates = await acm.listCertificates({
    CertificateStatuses: ['ISSUED', 'PENDING_VALIDATION']
  }).promise()

  const existingCertificate = certificates.CertificateSummaryList.filter(certificate => (
    certificate.DomainName === certificateDomain
  ))[0]

  if (existingCertificate) {
    existingCertificateSpinner.succeed()
    certificateArn = existingCertificate.CertificateArn
  } else {
    existingCertificateSpinner.fail()

    const requestingCertificateSpinner = ora(`Requesting certificate for ${certificateDomain}`).start()

    const requestedCertificate = await acm.requestCertificate({
      DomainName: certificateDomain,
      ValidationMethod: 'DNS'
    }).promise()

    if (requestedCertificate) {
      requestingCertificateSpinner.succeed()
      certificateArn = requestedCertificate.CertificateArn
    } else {
      requestingCertificateSpinner.fail()
      return
    }
  }

  const certificateIssuedSpinner = ora('Checking certificate status').start()

  let certificateIssued = false
  let certificateValidationRecord = null

  while (!certificateIssued) {
    const description = await acm.describeCertificate({
      CertificateArn: certificateArn
    }).promise()

    const status = description.Certificate.Status

    switch (status) {
      case 'ISSUED':
        certificateIssued = true
        certificateIssuedSpinner.succeed(`Certificate status: ${status}`)
        break
      case 'PENDING_VALIDATION':
        const options = description.Certificate.DomainValidationOptions

        certificateValidationRecord = options && options[0] && options[0].ResourceRecord

        certificateIssuedSpinner.text = `Certificate status: ${status}`

        if (certificateValidationRecord) {
          const { Type, Name, Value } = certificateValidationRecord

          certificateIssuedSpinner.text = [
            `Certificate status: ${status}`,
            colors.yellow(`Please add the following DNS record to ${domain}:`),
            `Type: ${Type}`,
            `Name: ${Name}`,
            `Value: ${Value}`
          ].join('\n')
        }

        await delay(2000)
        break
      default:
        throw new Error(status)
    }
  }

  const mainFunctionName = safeLambdaFunctionName(`${hostname}-main`)
  const buildFunctionName = safeLambdaFunctionName(`${hostname}-build`)

  const parameters = [
    {
      ParameterKey: 'Domain',
      ParameterValue: hostname
    }, {
      ParameterKey: 'MainFunctionName',
      ParameterValue: mainFunctionName
    }, {
      ParameterKey: 'BuildFunctionName',
      ParameterValue: buildFunctionName
    }, {
      ParameterKey: 'BuildFunctionCode',
      ParameterValue: fs.readFileSync(path.join(__dirname, 'build.js'), 'utf-8')
    }, {
      ParameterKey: 'StageName',
      ParameterValue: 'production'
    }, {
      ParameterKey: 'CertificateArn',
      ParameterValue: certificateArn
    }
  ]

  const templatePath = path.join(__dirname, 'template.json')
  const template = fs.readFileSync(templatePath, 'utf-8')

  const stackName = safeStackName(hostname)

  const outputs = await createOrUpdateStack({
    name: stackName,
    template,
    parameters,
    region
  })

  const projectUploadSpinner = ora('Uploading project source').start()

  const projectSourceArchive = archiver('tar')

  const files = ignore()
    .add(['node_modules'])
    .filter(glob.sync('**/*.*', { cwd: projectPath }))

  files.forEach(file => {
    projectSourceArchive.append(fs.createReadStream(path.join(projectPath, file)), { name: file })
  })

  projectSourceArchive.finalize()

  const s3 = new S3({ region })

  await s3.upload({
    Bucket: hostname,
    Key: 'source.tar',
    Body: projectSourceArchive
  }).promise()

  projectUploadSpinner.succeed()

  const lambda = new Lambda({ region })

  const installSpinner = ora('Installing dependencies').start()

  const buildResult = await lambda.invoke({
    FunctionName: buildFunctionName
  }).promise()

  if (buildResult.FunctionError) {
    installSpinner.fail()
    throw new Error(buildResult.FunctionError)
  }

  if (buildResult.StatusCode !== 200) {
    installSpinner.fail()
    throw new Error(`Status code: ${buildResult.statusCode}. Expected: 200`)
  }

  installSpinner.succeed()

  const updateProjectSourceCode = ora('Updating source function').start()

  await lambda.updateFunctionCode({
    FunctionName: mainFunctionName,
    S3Bucket: hostname,
    S3Key: 'target.zip'
  }).promise()

  updateProjectSourceCode.succeed()

  ora(`Deployed ${hostname} successfully`).succeed()

  console.log([
    colors.yellow(`Please add the following DNS record to ${domain}:`),
    `Type: CNAME`,
    `Name: ${hostname}`,
    `Value: ${outputs.DomainName}`
  ].join('\n'))
}

async function createOrUpdateStack ({ region, name, template, parameters }) {
  const cloudformation = new CloudFormation({ region })

  const validateSpinner = ora('Validating stack template').start()

  await cloudformation.validateTemplate({
    TemplateBody: template
  }).promise()

  validateSpinner.succeed()

  let exists = false

  const existsSpinner = ora('Checking if stack already exists').start()

  try {
    await cloudformation.describeStacks({
      StackName: name
    }).promise()

    exists = true

    existsSpinner.succeed()
  } catch (error) {
    existsSpinner.succeed('Stack does not exist')

    if (error.statusCode !== 400) {
      validateSpinner.fail()
      throw error
    }
  }

  const createSpinner = ora(`${exists ? 'Updating' : 'Creating'} stack`).start()

  try {
    await cloudformation[`${exists ? 'update' : 'create'}Stack`]({
      StackName: name,
      TemplateBody: template,
      Parameters: parameters,
      Capabilities: ['CAPABILITY_IAM']
    }).promise()
  } catch (error) {
    if (error.message === 'No updates are to be performed.') {
      createSpinner.info(error.message)
    } else {
      createSpinner.warn(error.message)
    }

    if (error.code !== 'ValidationError') {
      throw error
    }
  }

  while (true) {
    try {
      const result = await cloudformation.describeStacks({
        StackName: name
      }).promise()

      const stack = result.Stacks[0]
      const status = stack.StackStatus

      switch (status) {
        case 'CREATE_COMPLETE':
        case 'UPDATE_COMPLETE':
          const outputs = {}

          stack.Outputs.forEach(output => {
            outputs[output.OutputKey] = output.OutputValue
          })

          if (createSpinner.isSpinning) {
            createSpinner.succeed()
          }

          return outputs
        case 'CREATE_IN_PROGRESS':
        case 'UPDATE_IN_PROGRESS':
        case 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS':
          await delay(2000)
          break

        default:
          createSpinner.fail()
          throw new Error(status)
      }
    } catch (error) {
      throw error
    }
  }
}

function safeLambdaFunctionName (name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '-')
}

function safeStackName (name) {
  return name.replace(/[^-a-zA-Z0-9]/g, '-')
}

function delay (ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
