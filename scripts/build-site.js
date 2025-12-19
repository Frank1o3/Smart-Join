const fs = require('fs')
const path = require('path')

const manifestPath = path.join(__dirname, '..', 'src', 'manifest.json')
const templatePath = path.join(__dirname, '..', 'site', 'version.template.html')
const outPath = path.join(__dirname, '..', 'site', 'version.html')

function main(){
  if(!fs.existsSync(manifestPath)){
    console.error('manifest.json not found at', manifestPath)
    process.exit(1)
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const version = manifest.version || '0.0.0'

  let tpl = fs.readFileSync(templatePath, 'utf8')
  tpl = tpl.replace('__VERSION__', version)

  fs.writeFileSync(outPath, tpl, 'utf8')
  console.log('Wrote', outPath)
}

main()
