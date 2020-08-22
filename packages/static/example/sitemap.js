const fs = require('fs')
const path = require('path')

const sitemap = {
  '/': require('./src/index'),
  '/works/': require('./src/works'),
  '/styles.css': () => fs.createReadStream(path.join(__dirname, 'src/styles.css'))
}

const works = ['a', 'b']

works.forEach(slug => {
  sitemap[`/works/${slug}`] = require('./src/work').bind(null, slug)
})

// static(path.join('__dirname', 'src/assets'))
// console.log(JSON.stringify(Object.keys(sitemap), null, 2))

module.exports = sitemap
