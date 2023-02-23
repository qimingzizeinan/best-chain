/**
 * npm install
 * @param {Object} options - install options
 *  - {String} root - npm install root dir
 *  - {String} [registry] - npm registry url, default is `https://registry.npmjs.com`
 *  - {String} [targetDir] - node_modules target dir, default is ${root}.
 *  - {String} [storeDir] - npm modules store dir, default is `${targetDir}/node_modules`
 *  - {Number} [timeout] - npm registry request timeout, default is 60000 ms
 *  - {Number} [streamingTimeout] - download tar.gz stream timeout, default is 120000 ms
 *  - {Console} [console] - console logger instance, default is `console`
 *  - {Array<Object>} [pkgs] - optional packages to install, default is `[]`
 *  - {Boolean} [production] - production mode install, default is `false`
 *  - {Object} [env] - postinstall and preinstall scripts custom env.
 *  - {String} [cacheDir] - tarball cache store dir, default is `$HOME/.npminstall_tarball`.
 *  	if `production` mode enable, `cacheDir` will be disable.
 *  - {Object} [binaryMirrors] - binary mirror config, default is `{}`
 *  - {Boolean} [ignoreScripts] - ignore pre / post install scripts, default is `false`
 *  - {Array} [forbiddenLicenses] - forbit install packages which used these licenses
 *  - {Boolean} [trace] - show memory and cpu usages traces of installation
 *  - {Boolean} [flatten] - flatten dependencies by matching ancestors' dependencies
 *  - {Boolean} [disableFallbackStore] - disable fallback store, default is `false`
 * @param {Object} context - install context
 */
interface Pkg {
  name: string
  version: string
}
interface Options {
  root: string
  registry?: string
  targetDir?: string
  storeDir?: string
  timeout?: number
  streamingTimeout?: number
  console?: Console
  pkgs?: Pkg[]
  production?: boolean
  env?: Object
  cacheDir?: string
  binaryMirrors?: Object
  ignoreScripts?: boolean
  forbiddenLicenses?: any
  trace?: boolean
  flatten?: boolean
  disableFallbackStore?: boolean
}

declare module 'npminstall' {
  export default function npminstall(params: Options): void
}
