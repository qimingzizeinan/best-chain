import { describe, test, expect, beforeAll, afterEach } from 'vitest'
import { join } from 'node:path'
import type { ExecaSyncReturnValue, SyncOptions } from 'execa'
import { execaCommandSync } from 'execa'
import fs from 'fs-extra'

const CLI_PATH = join(__dirname, '..')

const projectName = 'test-app'
const genPath = join(__dirname, projectName)

const templateFiles = fs.readdirSync(join(CLI_PATH, './templates/template-electron')).sort()
const configTemplateFiles = fs
  .readdirSync(join(CLI_PATH, './templates/template-deploy-config'))
  .sort()

// Helper to create a non-empty directory
const createNonEmptyDir = () => {
  // Create the temporary directory
  fs.mkdirpSync(genPath)

  // Create a package.json file
  const pkgJson = join(genPath, 'package.json')
  fs.writeFileSync(pkgJson, '{ "axios": "1.2.3" }')
}

const run = (args: string[], options: SyncOptions = {}): ExecaSyncReturnValue => {
  return execaCommandSync(`node ${CLI_PATH} ${args.join(' ')}`, options)
}

beforeAll(() => fs.remove(genPath))
afterEach(() => fs.remove(genPath))

describe('create template init', () => {
  test('the project name was not provided.', () => {
    const { stdout } = run([])

    expect(stdout).toContain('Package name:')
  })

  test('target dir is current directory', () => {
    fs.mkdirpSync(genPath)
    const { stdout } = run(['.'], { cwd: genPath })
    expect(stdout).toContain('Select a framework:')
  })

  test('the framework name was not provided.', () => {
    const { stdout } = run([projectName])
    expect(stdout).toContain('Select a framework:')
  })

  test('prompts for the framework on not supplying a value for --template', () => {
    const { stdout } = run([projectName, '--template'])
    expect(stdout).toContain('Select a framework:')
  })

  test('not supplying a value for --template', () => {
    const { stdout } = run(['--template'])
    expect(stdout).toContain('Package name:')
  })

  test('asks to overwrite non-empty target directory', () => {
    createNonEmptyDir()
    const { stdout } = run([projectName], { cwd: __dirname })
    expect(stdout).toContain(`Target directory "${projectName}" is not empty.`)
  })

  test('asks to overwrite non-empty current directory', () => {
    createNonEmptyDir()
    const { stdout } = run(['.'], { cwd: genPath })
    expect(stdout).toContain('Current directory is not empty.')
  })

  test('successfully scaffolds a project based on deploy config template', () => {
    run([projectName, '--template', 'electron'], {
      cwd: __dirname
    })

    const generatedFiles = fs.readdirSync(genPath).sort()
    // Assertions
    expect(templateFiles).toEqual(generatedFiles)
  })

  test('Do not create parent directory', () => {
    fs.mkdirpSync(genPath)

    run(['--template', 'deploy-config', '--no', '1'], {
      cwd: genPath
    })

    const generatedFiles = fs.readdirSync(genPath).sort()
    // Assertions
    expect(configTemplateFiles).toEqual(generatedFiles)
  })
})
