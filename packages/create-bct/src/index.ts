import minimist from 'minimist'
import fs from 'node:fs'
import {
  isEmptyDir,
  isExistsSync,
  emptyDirSync,
  mkdirSync,
  copy,
  errorStep
} from '@best-chain/utils'
import { getTemplates, FRAMEWORKS, Framework, FrameworkNames } from './frameworks'
import path from 'node:path'
import prompts from 'prompts'
import { reset, red, blue, bgGreen, bgRed } from 'kolorist'
import { fileURLToPath } from 'node:url'

type SelectResult = {
  framework: Framework<FrameworkNames> | null
  overwrite: boolean
  packageName: string
}

const argv = minimist<{
  t?: string
  template?: string
  no?: string
}>(process.argv.slice(2), { string: ['_'] })

const isNotJoinTargetDir = (() => {
  if (typeof argv.no === 'string') {
    switch (argv.no) {
      case 'false':
      case 'null':
      case 'undefined':
      case '0':
      case '-0':
      case '':
      case '0n':
      case 'NaN':
        return false
      default:
        return true
    }
  } else {
    return !!argv.no
  }
})()

const cwd = process.cwd()

async function getFrameworkByName(name: string) {
  return FRAMEWORKS.find((item) => {
    return item.name === name
  })
}
async function selectTemplate(targetDir: string, argTemplate: FrameworkNames) {
  let result: SelectResult = {
    overwrite: false,
    packageName: '',
    framework: null
  }
  try {
    if (!isNotJoinTargetDir) {
      result = await prompts(
        [
          {
            type: () => (!isExistsSync(targetDir) || isEmptyDir(targetDir) ? null : 'confirm'),
            name: 'overwrite',
            message: () =>
              (targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`) +
              ' is not empty. Remove existing files and continue?'
          },
          {
            type: () => (isValidPackageName(getProjectName(targetDir)) ? null : 'text'),
            name: 'packageName',
            message: reset('Package name:'),
            initial: () => toValidPackageName(getProjectName(targetDir)),
            validate: (dir) => isValidPackageName(dir) || 'Invalid package.json name'
          },
          {
            type: argTemplate && getTemplates().includes(argTemplate) ? null : 'select',
            name: 'framework',
            message:
              typeof argTemplate === 'string' &&
              argTemplate &&
              !getTemplates().includes(argTemplate)
                ? reset(`"${argTemplate}" isn't a valid template. Please choose from below: `)
                : reset('Select a framework:'),
            initial: 0,
            choices: FRAMEWORKS.map((framework) => {
              const color = framework.color
              return {
                title: color(framework.display || framework.name),
                value: framework
              }
            })
          }
        ],
        {
          onCancel: () => {
            throw new Error(red('✖') + ' Operation cancelled')
          }
        }
      )
    }

    if (!result.framework && argTemplate) {
      const r = await getFrameworkByName(argTemplate)
      result.framework = r ? r : result.framework
    }

    return {
      overwrite: result.overwrite,
      packageName: result.packageName,
      framework: result.framework
    }
  } catch (error) {
    console.error(error)
    return result
  }
}

export async function init() {
  console.log(bgGreen('start creating template using best-chain.'))

  const targetDir = formatTargetDir(argv._[0]) || ''
  const argTemplate = (argv.template as FrameworkNames) || (argv.t as FrameworkNames)

  let result: SelectResult = {
    framework: null,
    overwrite: false,
    packageName: ''
  }

  result = await selectTemplate(targetDir, argTemplate)

  const { framework, overwrite, packageName } = result

  if (!framework) return

  if (!framework.ready) {
    errorStep(framework.notReadyTip)
    return
  }

  let root = isNotJoinTargetDir ? cwd : path.join(cwd, targetDir)

  if (overwrite) {
    emptyDirSync(root)
  } else if (!isExistsSync(root)) {
    mkdirSync(root, { recursive: true })
  }

  let template = framework.name || argTemplate

  const pkgManager = 'pnpm'

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    '../../templates',
    `template-${template?.toLocaleLowerCase()}`
  )

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }

  const files = fs.readdirSync(templateDir)
  for (const file of files.filter((f) => f !== 'package.json')) {
    write(file)
  }

  const packagePath = path.join(templateDir, 'package.json')

  if (!isExistsSync(packagePath)) {
    console.log('\nDone.\n')
    return
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
  pkg.name = packageName || getProjectName(targetDir)

  write('package.json', JSON.stringify(pkg, null, 2) + '\n')

  const cdProjectName = path.relative(cwd, root)

  console.log('\nDone. Now run:\n')

  if (root !== cwd) {
    console.log(blue(`  cd ${cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName}`))
  }

  console.log(blue(`  ${pkgManager} install`))
  console.log(blue(`  ${pkgManager} run dev`))
}

export function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '')
}

export function getProjectName(targetDir: string) {
  return targetDir === '.' ? path.basename(path.resolve()) : targetDir
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName)
}

init().catch((e) => {
  console.error(e)
})
