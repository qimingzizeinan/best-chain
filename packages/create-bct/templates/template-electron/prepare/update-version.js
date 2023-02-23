const semver = require('semver')
const prompts = require('prompts')
const fse = require('fs-extra')
const path = require('path')
const kolorist = require('kolorist')
const pkg = require('../package.json')

const versionIncrements = ['patch', 'minor', 'major']

function inc(currentVersion, i, identifier) {
  return semver.inc(currentVersion, i, identifier)
}

async function updateVersion() {
  const result = await prompts([
    {
      type: 'confirm',
      name: 'change',
      message: `Current version:${pkg.version}. Modify the version number?`,
    },
  ])
  const { change } = result
  // modify version

  if (change) {
    const { release } = await prompts({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(item => ({
        title: item,
        value: item,
      })),
    })

    pkg.version = inc(pkg.version, release)

    fse.writeFileSync(
      path.join(__dirname, '../package.json'),
      JSON.stringify(pkg, null, 2),
    )

    console.log(kolorist.blue(`\n Done. current version: ${pkg.version} \n`))
  }
}

updateVersion().catch(e => {
  console.error(e)
})
