import axios from 'axios'
import urlJoin from 'url-join'
import semver from 'semver'

const defaultRegistry = 'https://registry.npmjs.org'

// get info from npm
function getNpmInfo(pkgName: string, registry = defaultRegistry) {
  const register = registry
  const url = urlJoin(register, pkgName)

  return axios.get(url).then(function (response) {
    try {
      if (response.status === 200) {
        return response.data
      }
    } catch (error) {
      return Promise.reject(error)
    }
  })
}

// 获取某个 npm 的最新版本号
function getLatestVersion(pkgName: string, registry = defaultRegistry) {
  return getNpmInfo(pkgName, registry).then(function (data) {
    if (!data['dist-tags'] || !data['dist-tags'].latest) {
      console.error('没有 latest 版本号', data)
      return Promise.reject(new Error('Error: 没有 latest 版本号'))
    }
    const latestVersion = data['dist-tags'].latest
    return latestVersion
  })
}

// 获取某个 npm 的所有版本号
function getVersions(pkgName: string, registry = defaultRegistry) {
  return getNpmInfo(pkgName, registry).then(function (body) {
    const versions = Object.keys(body.versions)
    return versions
  })
}

// 根据指定 version 获取符合 semver 规范的最新版本号
function getLatestSemverVersion(baseVersion: any, versions: any) {
  versions = versions
    .filter(function (version: any) {
      return semver.satisfies(version, '^' + baseVersion)
    })
    .sort(function (a: any, b: any) {
      return semver.gt(b, a)
    })
  return versions[0]
}

// 根据指定 version 和包名获取符合 semver 规范的最新版本号
function getNpmLatestSemverVersion(pkgName: string, baseVersion: any, registry = defaultRegistry) {
  return getVersions(pkgName, registry).then(function (versions: any) {
    return getLatestSemverVersion(baseVersion, versions)
  })
}

export { defaultRegistry, getNpmInfo, getLatestVersion, getNpmLatestSemverVersion }
