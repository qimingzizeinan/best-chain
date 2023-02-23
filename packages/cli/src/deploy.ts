import { NodeSSH, Config as NodeSSHConfig } from 'node-ssh'
import fs from 'node:fs'
import path from 'node:path'
import { red, blue, green, cyan } from 'kolorist'
import {
  DeployConfig,
  LocalFileConfig,
  Server,
  ServerFileConfig
} from './interfaces/deploy.interface'
import prompts from 'prompts'
import ora from 'ora'
import { execaCommandSync } from 'execa'
import compressing from 'compressing'
import { importAsync } from '@best-chain/utils'

let SSH: NodeSSH | null

const configFileName = 'bc-deploy.js'

export function step(msg: string) {
  console.log(cyan(msg))
}

export function errorStep(msg: string) {
  console.log(red(msg))
}

export function info(msg: string) {
  console.log(cyan(msg))
}

export function createSSH() {
  return (SSH = new NodeSSH())
}

/**
 * @param {*} _path
 * @param {*} _file
 */
export const resolvePath = (_path: string, _file: string) => path.resolve(_path, _file)
/**
 * Select environment to deploy.
 * @param {*} CONFIG configuration
 */
export function selectDeployEnv(servers: Server[]): Promise<Server> {
  return new Promise(async (resolve, reject) => {
    let result: prompts.Answers<'config'>
    result = await prompts(
      [
        {
          type: 'select',
          name: 'config',
          message: 'selecte deploy env',
          choices: servers.map((item, index) => ({
            title: `${item.server.name}`,
            value: index
          }))
        }
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        }
      }
    )

    const { config } = result

    const selectedServer = servers[config]

    if (selectedServer) {
      resolve(selectedServer)
    } else {
      reject()
    }
  })
}

function exec(command: any, args: any, options: any) {
  const win32 = process.platform === 'win32'

  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args

  return require('child_process').spawn(cmd, cmdArgs, options || {})
}

export async function getConfig(): Promise<DeployConfig | undefined> {
  const configFile = resolvePath(process.cwd(), `./${configFileName}`)
  if (!fs.existsSync(configFile)) {
    errorStep(`${configFile} does not exist.`)
    console.log(blue('create command: pnpm create bct --template deploy-config'))
    return
  }

  // load configuration
  let config: DeployConfig

  try {
    const result: any = await importAsync(configFile)
    config = result.default
  } catch (error: any) {
    errorStep(error)
    return
  }

  try {
    const localKeys = ['buildCommand', 'distDir', 'distZip']

    const serverKeys = [
      'name',
      'host',
      'port',
      'username',
      'password',
      'distDir',
      'distZipName',
      'backup'
    ]

    const configError = config.servers.some((item) => {
      const localKeys = Object.keys(item.local)
      const serverKeys = Object.keys(item.server)

      const hasAllLocalKey = localKeys.every((item) => localKeys.includes(item))
      const hasAllServerKey = serverKeys.every((item) => serverKeys.includes(item))
      return !hasAllLocalKey || !hasAllServerKey
    })

    // Configuration item error
    if (configError) {
      errorStep('Incorrect configuration！\n')
      info(`Fields required by local：{${localKeys.join(', ')}}\n`)
      info(`Fields required by server：{${serverKeys.join(', ')}}\n`)
      return
    }
  } catch (err: any) {
    errorStep(err)
  }
  return config
}

/**
 * Compress local files
 * @param {*} localConfig local configuration
 * @param {*} next
 */
export async function compressFiles(localConfig: LocalFileConfig) {
  try {
    const { distDir, distZip } = localConfig
    const dist = resolvePath(process.cwd(), distDir)

    if (!fs.existsSync(dist)) {
      errorStep('× compress fail！')
      errorStep(`× [local.distDir] path is incorrect configuration！ ${dist} is not exist！\n`)
      return
    }

    const spinner = ora(cyan('compressing...\n')).start()

    await compressing.zip.compressDir(dist, resolvePath(process.cwd(), distZip))

    spinner.succeed(green('Compression complete!\n'))
    // if (next) next()
  } catch (err) {
    errorStep(`Compression failure！ \n error:${JSON.stringify(err)}`)
  }
}

/**
 * Connection server
 * @param {*} connectConfig { host, port, username, password }
 */
async function connectServer(connectConfig: NodeSSHConfig) {
  const spinner = ora(cyan('Connecting to the server...\n')).start()
  await SSH?.connect(connectConfig)
    .then(() => {
      spinner.succeed(green('Server connection succeeded.！\n'))
    })
    .catch((err) => {
      spinner.fail(red('Server connection failed！\n'))
      errorStep(err)
      process.exit(1)
    })
}

/**
 * deploy
 * @param localConfig
 * @param serverConfig
 * @param next
 */
export async function deploy(localConfig: LocalFileConfig, serverConfig: ServerFileConfig) {
  const { host, port, username, password, distDir, distZipName, backup } = serverConfig

  if (!host || !username || !password || !distDir || !distZipName) {
    errorStep(`${configFileName} incorrect configuration！`)
    process.exit(1)
  }
  if (!distDir.startsWith('/') || distDir === '/') {
    errorStep(
      `[server.distDir: ${distDir}] Must be an absolute path and cannot be the root directory "/"`
    )
    process.exit(1)
  }

  // Connection server
  await connectServer({ host, port, username, password })

  const spinner = ora(cyan('Deploying project...\n')).start()

  try {
    // Upload the compressed project file
    await SSH?.putFile(
      resolvePath(process.cwd(), localConfig.distZip),
      `${distDir}/${distZipName}.zip`
    ).catch((err) => {
      console.log('[error]putFile: ', err)
    })

    if (backup) {
      // Back up the files that renamed the original project.
      await runCommandAtServer(`mv ${distZipName} ${distZipName}_${getTime()}`, distDir)
    } else {
      // Delete the file of the original project
      await runCommandAtServer(`rm -rf ${distZipName}`, distDir).catch((err) => {
        console.log('[error]rmOldFile: ', err)
      })
    }

    // Modify file permissions
    await runCommandAtServer(`chmod 777 ${distZipName}.zip`, distDir).catch((err) => {
      console.log('[error]chmod: ', err)
    })

    // Unzip the uploaded project file.
    await runCommandAtServer(`unzip ./${distZipName}.zip -d ${distZipName}`, distDir).catch(
      (err) => {
        console.log('[error]unzip: ', err)
      }
    )

    // Delete the compressed project file on the server.
    await runCommandAtServer(`rm -rf ./${distZipName}.zip`, distDir).catch((err) => {
      console.log('[error]rmzip: ', err)
    })

    spinner.succeed(green('Deployment succeeded.\n'))

    await SSH?.dispose()
    SSH = null

    info(`Project path： ${distDir}`)
    info(`Finish time: ${new Date()}`)
    info('')
  } catch (err) {
    spinner.fail(red('Deployment failed.\n'))
    errorStep(`catch: ${err}`)
    process.exit(1)
  }
}

/**
 * 通过 ssh 在服务器上执行命令
 * @param {*} cmd shell 命令
 * @param {*} cwd 路径
 */
async function runCommandAtServer(cmd: string, cwd: string) {
  await SSH?.execCommand(cmd, {
    cwd,
    onStderr(chunk) {
      errorStep(`${cmd}, stderrChunk, ${chunk.toString('utf8')}`)
    }
  })
}
/**
 * get time
 * @returns 2020-6-19_00-00-00
 */
export const getTime = function getTime() {
  const _Date = new Date()
  const date = _Date.toJSON().split('T')[0]
  const time = _Date.toTimeString().split(' ')[0].replace(/\:/g, '-')
  return `${date}_${time}`
}

export async function start() {
  await createSSH()
  step('getting configuration...')
  const c = await getConfig()
  if (!c) return

  const config = await selectDeployEnv(c.servers)
  if (!config) {
    errorStep('not found configuration')
    return
  }

  step('======== start deployment ========')
  // build local project
  const command = config.local.buildCommand

  try {
    const spinner = ora(cyan('Executing local build command....\n')).start()
    await execaCommandSync(command)
    spinner.succeed(green('End of execution！\n'))
  } catch (error: any) {
    errorStep(error.stderr)
  }

  await compressFiles(config.local)
  await deploy(config.local, config.server)
  step('======== Deployment completed ========')
  process.exit()
}
