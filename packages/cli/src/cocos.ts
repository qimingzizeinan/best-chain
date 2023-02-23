import { compressFiles, createSSH, deploy, getConfig, selectDeployEnv } from './deploy'
import { DeployConfig } from './interfaces/deploy.interface'
import fse from 'fs-extra'
import prompts from 'prompts'
import { cyan, red } from 'kolorist'
import { execaCommandSync } from 'execa'
import semver, { ReleaseType } from 'semver'
import type { SyncOptions } from 'execa'

export type CocosDeployType = 'base' | 'b' | 'hot' | 'h' | 'push' | 'p' | 'match' | 'm' | 'platform'

let config: DeployConfig | null

const versionIncrements = ['patch', 'minor', 'major']

export function step(msg: string) {
  console.log(cyan(msg))
}

export function errorStep(msg: string) {
  console.log(red(msg))
}

export function info(msg: string) {
  console.log(cyan(msg))
}

export async function cmd(cmd: string, options?: SyncOptions<string> | undefined) {
  return await execaCommandSync(cmd, { ...options })
}

function inc(currentVersion: string, i: ReleaseType, identifier?: string) {
  return semver.inc(currentVersion, i, identifier)!
}

// modify version
async function modifyVersion() {
  const manifestPath = config?.cocos.versionManifest!
  const file = await fse.readFileSync(manifestPath, 'utf8')

  const pkg = JSON.parse(file)

  try {
    let result: prompts.Answers<'change'>
    // Modify the version number?
    result = await prompts([
      {
        type: 'confirm',
        name: 'change',
        message: `Current version:${pkg.version}. Modify the version number?`
      }
    ])
    const { change } = result
    // modify version

    if (change) {
      const { release } = await prompts({
        type: 'select',
        name: 'release',
        message: 'Select release type',
        choices: versionIncrements.map((item, index) => ({
          title: item,
          value: item
        }))
      })

      pkg.version = inc(pkg.version, release)

      fse.writeFileSync(manifestPath, JSON.stringify(pkg))
    }
  } catch (error) {
    console.error(error)
  }
}

// cocos creator build
async function cocosBuildIOS() {
  try {
    step('Cocos creator building...')
    const { editorPath, projectRoot, buildConfig } = config?.cocos!
    await cmd(`${editorPath} --project ${projectRoot} --build "configPath=${buildConfig}"`)
  } catch (error: any) {
    errorStep(error)
  }
}

// IOS ipa打包
async function iosIpaBuild() {
  try {
    step('Fastlane building...')
    try {
      const { stdout } = execaCommandSync('fastlane beta', {
        cwd: config?.cocos.fastlaneRoot
      })
      console.log(stdout)
    } catch (error: any) {
      errorStep(error)
    }
  } catch (error: any) {
    errorStep(error)
  }
}

// 压缩assets并且部署到服务器
export async function assetsCompressAndDeploy() {
  await createSSH()
  step('Getting deployment server configuration...')

  const c = await getConfig()
  if (!c) return

  const config = await selectDeployEnv(c.servers)
  if (!config) {
    errorStep('Configruation not found')
    return
  }

  step('======== Starting deployment ========')

  await compressFiles(config.local)
  await deploy(config.local, config.server)
  step('======== Deployment complete ========')
  process.exit()
}

// 强制更新证书
export async function fastlaneMatchForce_match() {
  try {
    step('Fastlane match force_match...')
    try {
      const { stdout } = execaCommandSync('fastlane force_match', {
        cwd: config?.cocos.fastlaneRoot
      })

      console.log(stdout)
    } catch (error: any) {
      errorStep(error)
    }
  } catch (error: any) {
    errorStep(error)
  }
}
// 将压缩的assets文件夹上传到服务器
async function pushAssetsToServer() {
  await createSSH()
  step('Getting deployment server configuration...')
  let c = await getConfig()
  if (!c) return
  const config = await selectDeployEnv(c.servers)
  if (!config) {
    errorStep('Configruation not found')
    return
  }

  step('======== Starting deployment ========')

  await deploy(config.local, config.server)
  step('======== Deployment complete ========')
  process.exit()
}

// 底包的流程
export async function baseBag() {
  await modifyVersion()
  await cocosBuildIOS()
  await cocosBuildIOS()
  await iosIpaBuild()
}

// 热更包流程
export async function hotUpdateBag() {
  await modifyVersion()
  await cocosBuildIOS()
}

export async function cocosDeploy(type: CocosDeployType) {
  const c = await getConfig()
  if (!c) return
  config = c

  switch (type) {
    case 'base': //打底包
    case 'b':
      baseBag()
      break
    case 'hot': //打热更
    case 'h':
      hotUpdateBag()
      break
    case 'push': //压缩包并上传
    case 'p':
      assetsCompressAndDeploy()
      break
    case 'match':
    case 'm':
      fastlaneMatchForce_match()
      break
    case 'platform': //选择平台
      break
    default:
      break
  }
}
