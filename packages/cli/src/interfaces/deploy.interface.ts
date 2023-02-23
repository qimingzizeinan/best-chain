export interface CocosConfig {
  projectRoot: string
  editorPath: string
  buildConfig: string
  fastlaneRoot: string
  versionManifest: string
}

export interface LocalFileConfig {
  buildCommand: string
  distDir: string
  distZip: string
}

export interface ServerFileConfig {
  name: string
  host: string
  port: string
  username: string
  password: string
  distDir: string
  distZipName: string
  backup: boolean
}

export interface Server {
  local: LocalFileConfig
  server: ServerFileConfig
}

export interface DeployConfig {
  cocos: CocosConfig
  servers: Server[]
}
