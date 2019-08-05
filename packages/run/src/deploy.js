const fs = require('fs')
const path = require('path')
const psl = require('psl')
const archiver = require('archiver')
const glob = require('glob')
const ignore = require('ignore')
const Table = require('cli-table')
const CloudFormation = require('aws-sdk/clients/cloudformation')
const S3 = require('aws-sdk/clients/s3')
const Lambda = require('aws-sdk/clients/lambda')
const ACM = require('aws-sdk/clients/ACM')

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

  const recordsTable = new Table({
    head: ['Type', 'Name', 'Value']
  })

  const acm = new ACM({
    region: 'us-east-1'
  })

  let certificateArn = null

  console.log(`Getting certificate for ${certificateDomain}...`)

  while (!certificateArn) {
    const certificates = await acm.listCertificates({
      CertificateStatuses: ['ISSUED', 'PENDING_VALIDATION']
    }).promise()

    let certificate = certificates.CertificateSummaryList.filter(certificate => (
      certificate.DomainName === certificateDomain
    ))[0]

    if (!certificate) {
      console.log('Requesting certificate...')

      certificate = await acm.requestCertificate({
        DomainName: certificateDomain,
        ValidationMethod: 'DNS'
      }).promise()
    }

    certificateArn = certificate.CertificateArn
  }

  let certificateRecord = null

  while (!certificateRecord) {
    const description = (await acm.describeCertificate({
      CertificateArn: certificateArn
    }).promise()).Certificate

    const status = description.Status

    console.log(`Certificate status: ${status}`)

    switch (status) {
      case 'ISSUED':
      case 'PENDING_VALIDATION':
        certificateRecord = description.DomainValidationOptions.map(options => (
          options.ResourceRecord
        ))[0]

        if (certificateRecord) {
          recordsTable.push([
            certificateRecord.Type,
            certificateRecord.Name,
            certificateRecord.Value
          ])
        } else {
          await delay(2000)
        }
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
      ParameterKey: 'MainFunctionCode',
      ParameterValue: 'exports.handler = () => {}'
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

  console.log('Uploading source...')

  const archive = archiver('zip')

  const files = ignore()
    .add(['node_modules'])
    .filter(glob.sync('**/*.*', { cwd: projectPath }))

  files.forEach(file => {
    archive.append(fs.createReadStream(path.join(projectPath, file)), { name: file })
  })

  archive.finalize()

  const s3 = new S3({ region })

  await s3.upload({
    Bucket: hostname,
    Key: 'source.zip',
    Body: archive
  }).promise()

  console.log('Installing dependencies...')

  const lambda = new Lambda({ region })

  const buildResult = await lambda.invoke({
    FunctionName: buildFunctionName
  }).promise()

  if (buildResult.FunctionError) {
    throw new Error(`Error while installing dependencies (${buildResult.FunctionError})`)
  }

  if (buildResult.StatusCode !== 200) {
    throw new Error(`Build result statusCode ${buildResult.statusCode}. Expected 200`)
  }

  console.log('Updating function code...')

  await lambda.updateFunctionCode({
    FunctionName: mainFunctionName,
    S3Bucket: hostname,
    S3Key: 'build.zip'
  }).promise()

  console.log('Deployment success!')

  recordsTable.push([
    'CNAME',
    hostname,
    outputs.DomainName
  ])

  console.log(recordsTable.toString())
}

async function createOrUpdateStack ({ region, name, template, parameters }) {
  const cloudformation = new CloudFormation({ region })

  console.log(`Validating stack template...`)

  await cloudformation.validateTemplate({
    TemplateBody: template
  }).promise()

  let exists = false

  try {
    await cloudformation.describeStacks({
      StackName: name
    }).promise()

    exists = true
  } catch (error) {
    if (error.statusCode !== 400) {
      throw error
    }
  }

  console.log(`${exists ? 'Updating' : 'Creating'} stack...`)

  if (!exists) {
    console.log('Note: Setting up the initial Cloudfront Distribution takes a long time. It happens only once per hostname, so your next deployment will be a lot faster!')
  }

  try {
    await cloudformation[`${exists ? 'update' : 'create'}Stack`]({
      StackName: name,
      TemplateBody: template,
      Parameters: parameters,
      Capabilities: ['CAPABILITY_IAM']
    }).promise()
  } catch (error) {
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

          return outputs

        case 'CREATE_IN_PROGRESS':
        case 'UPDATE_IN_PROGRESS':
        case 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS':
          await delay(2000)
          break

        default:
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
