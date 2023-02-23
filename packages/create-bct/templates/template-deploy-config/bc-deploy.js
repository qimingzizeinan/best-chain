const path = require('path')

function join(...args) {
  return path.join(...args)
}

function getRoot() {
  return path.join(__dirname, './')
}

module.exports = {
  cocos: {
    // 项目根目录
    projectRoot: getRoot(),
    // cocos creator 编辑器目录
    // Example: /Applications/CocosCreator/Creator/3.6.2/CocosCreator.app/Contents/MacOS/CocosCreator
    editorPath: '',
    // cocos creator 打包时的配置文件路径
    buildConfig: `${getRoot()}build-config/buildConfig_ios.json`,
    // fastlane目录
    fastlaneRoot: join(getRoot(), './build/ios/proj/fastlane'),
    // 热更实用的version.manifest文件路径
    versionManifest: join(__dirname, './assets', 'version.manifest')
  },
  servers: [
    {
      // 本地项目配置
      local: {
        // 本地打包命令
        buildCommand: 'pnpm test:commad',
        // 要打包的路径
        distDir: './scripts',
        // 压缩包
        distZip: './scripts.zip'
      },
      // 服务器配置
      server: {
        // 名称
        name: 'server1',
        // ip
        host: '0.0.0.0',
        // 端口
        port: '22',
        // 服务器用户名
        username: 'username',
        // 服务器密码
        password: 'password',
        // 压缩包服务路径
        distDir: '/var/www/xxx/xxx',
        // 压缩包名称
        distZipName: 'dist',
        // 是否部署前备份服务器文件
        backup: false
      }
    }
  ]
}
