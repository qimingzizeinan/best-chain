import fs from 'fs'
import path from 'path'
import cac from 'cac'
import packageConfig from '../package.json'
import { red, yellow } from 'kolorist'
import { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } from './constant'
import semver from 'semver'
import userHome from 'user-home'
import minimist from 'minimist'
import dotenv from 'dotenv'
import { npm, info, step, errorStep } from '@best-chain/utils'
import { start } from './deploy'
import { cocosDeploy, CocosDeployType } from './cocos'

type MinimistReturnType = ReturnType<typeof minimist>
let args: MinimistReturnType

let config: any

function startCommand() {
  const cli = cac()

  cli.version(packageConfig.version).usage('<command> [options]')

  cli.command('server', 'Deployment server project').action(async () => {
    start()
  })

  cli
    .command(
      'cocos [type]',
      'Deployment cocos project. type = [base | b | hot | h | push | p | match | m | platform]'
    )
    .action(async (type: CocosDeployType) => {
      if (!type) {
        errorStep('Command error! example: bci cocos base')
        return
      }
      cocosDeploy(type)
    })

  cli.help()
  cli.parse()
}

async function prepare() {
  await showCliVersion()
  await checkNodeVersion()
  await checkUserHome()
  await checkEnv()
  await checkLocalCliUpdate()
}

function checkNodeVersion() {
  if (!semver.gte(process.version, LOWEST_NODE_VERSION)) {
    throw new Error(red(`Please use nodejs version above ${LOWEST_NODE_VERSION}.`))
  }
}

function showCliVersion() {
  info(`best-chain cli version: ${packageConfig.version}. Welcome to use`)
}

function checkUserHome() {
  if (!userHome || !fs.existsSync(userHome)) {
    // eslint-disable-next-line quotes
    throw new Error(red("The current login user's home directory does not exist!"))
  }
}

function checkEnv() {
  dotenv.config({
    path: path.resolve(userHome, '.env')
  })
  config = createCliConfig() // 准备基础配置
}

export function createCliConfig() {
  const cliConfig = {
    home: userHome,
    cliHome: ''
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, DEFAULT_CLI_HOME)
  }
  return cliConfig
}

async function checkLocalCliUpdate() {
  const currentVersion = packageConfig.version

  try {
    const lastVersion = await npm.getNpmLatestSemverVersion(packageConfig.name, currentVersion)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
      errorStep(
        yellow(`Please update manually. package name: ${packageConfig.name}，Current version：${packageConfig.version}，Latest version：${lastVersion}
        Update command： pnpm update -g ${packageConfig.name}`)
      )
    }
  } catch (error: any) {}
}

export async function init() {
  try {
    await prepare()
    startCommand()
  } catch (error) {
    console.error(error)
  }
}

init()
