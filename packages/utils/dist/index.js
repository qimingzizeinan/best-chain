'use strict';

var axios = require('axios');
var semver = require('semver');
var fs = require('node:fs');
var path = require('node:path');

function normalize (strArray) {
  var resultArray = [];
  if (strArray.length === 0) { return ''; }

  if (typeof strArray[0] !== 'string') {
    throw new TypeError('Url must be a string. Received ' + strArray[0]);
  }

  // If the first part is a plain protocol, we combine it with the next part.
  if (strArray[0].match(/^[^/:]+:\/*$/) && strArray.length > 1) {
    var first = strArray.shift();
    strArray[0] = first + strArray[0];
  }

  // There must be two or three slashes in the file protocol, two slashes in anything else.
  if (strArray[0].match(/^file:\/\/\//)) {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1:///');
  } else {
    strArray[0] = strArray[0].replace(/^([^/:]+):\/*/, '$1://');
  }

  for (var i = 0; i < strArray.length; i++) {
    var component = strArray[i];

    if (typeof component !== 'string') {
      throw new TypeError('Url must be a string. Received ' + component);
    }

    if (component === '') { continue; }

    if (i > 0) {
      // Removing the starting slashes for each component but the first.
      component = component.replace(/^[\/]+/, '');
    }
    if (i < strArray.length - 1) {
      // Removing the ending slashes for each component but the last.
      component = component.replace(/[\/]+$/, '');
    } else {
      // For the last component we will combine multiple slashes to a single one.
      component = component.replace(/[\/]+$/, '/');
    }

    resultArray.push(component);

  }

  var str = resultArray.join('/');
  // Each input component is now separated by a single slash except the possible first plain protocol part.

  // remove trailing slash before parameters or hash
  str = str.replace(/\/(\?|&|#[^!])/g, '$1');

  // replace ? in parameters with &
  var parts = str.split('?');
  str = parts.shift() + (parts.length > 0 ? '?': '') + parts.join('&');

  return str;
}

function urlJoin() {
  var input;

  if (typeof arguments[0] === 'object') {
    input = arguments[0];
  } else {
    input = [].slice.call(arguments);
  }

  return normalize(input);
}

var defaultRegistry = 'https://registry.npmjs.org';
// get info from npm
function getNpmInfo(pkgName, registry) {
    if (registry === void 0) { registry = defaultRegistry; }
    var register = registry;
    var url = urlJoin(register, pkgName);
    return axios.get(url).then(function (response) {
        try {
            if (response.status === 200) {
                return response.data;
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
    });
}
// 获取某个 npm 的最新版本号
function getLatestVersion(pkgName, registry) {
    if (registry === void 0) { registry = defaultRegistry; }
    return getNpmInfo(pkgName, registry).then(function (data) {
        if (!data['dist-tags'] || !data['dist-tags'].latest) {
            console.error('没有 latest 版本号', data);
            return Promise.reject(new Error('Error: 没有 latest 版本号'));
        }
        var latestVersion = data['dist-tags'].latest;
        return latestVersion;
    });
}
// 获取某个 npm 的所有版本号
function getVersions(pkgName, registry) {
    if (registry === void 0) { registry = defaultRegistry; }
    return getNpmInfo(pkgName, registry).then(function (body) {
        var versions = Object.keys(body.versions);
        return versions;
    });
}
// 根据指定 version 获取符合 semver 规范的最新版本号
function getLatestSemverVersion(baseVersion, versions) {
    versions = versions
        .filter(function (version) {
        return semver.satisfies(version, '^' + baseVersion);
    })
        .sort(function (a, b) {
        return semver.gt(b, a);
    });
    return versions[0];
}
// 根据指定 version 和包名获取符合 semver 规范的最新版本号
function getNpmLatestSemverVersion(pkgName, baseVersion, registry) {
    if (registry === void 0) { registry = defaultRegistry; }
    return getVersions(pkgName, registry).then(function (versions) {
        return getLatestSemverVersion(baseVersion, versions);
    });
}

var npm = /*#__PURE__*/Object.freeze({
  __proto__: null,
  defaultRegistry: defaultRegistry,
  getLatestVersion: getLatestVersion,
  getNpmInfo: getNpmInfo,
  getNpmLatestSemverVersion: getNpmLatestSemverVersion
});

let enabled = true;
// Support both browser and node environments
const globalVar = typeof self !== 'undefined'
    ? self
    : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
            ? global
            : {};
/**
 * Detect how much colors the current terminal supports
 */
let supportLevel = 0 /* none */;
if (globalVar.process && globalVar.process.env && globalVar.process.stdout) {
    const { FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = globalVar.process.env;
    if (NODE_DISABLE_COLORS || NO_COLOR || FORCE_COLOR === '0') {
        enabled = false;
    }
    else if (FORCE_COLOR === '1' || FORCE_COLOR === '2' || FORCE_COLOR === '3') {
        enabled = true;
    }
    else if (TERM === 'dumb') {
        enabled = false;
    }
    else if ('CI' in globalVar.process.env &&
        [
            'TRAVIS',
            'CIRCLECI',
            'APPVEYOR',
            'GITLAB_CI',
            'GITHUB_ACTIONS',
            'BUILDKITE',
            'DRONE',
        ].some(vendor => vendor in globalVar.process.env)) {
        enabled = true;
    }
    else {
        enabled = process.stdout.isTTY;
    }
    if (enabled) {
        supportLevel =
            TERM && TERM.endsWith('-256color')
                ? 2 /* ansi256 */
                : 1 /* ansi */;
    }
}
let options = {
    enabled,
    supportLevel,
};
function kolorist(start, end, level = 1 /* ansi */) {
    const open = `\x1b[${start}m`;
    const close = `\x1b[${end}m`;
    const regex = new RegExp(`\\x1b\\[${end}m`, 'g');
    return (str) => {
        return options.enabled && options.supportLevel >= level
            ? open + ('' + str).replace(regex, open) + close
            : '' + str;
    };
}
const red = kolorist(31, 39);
const cyan = kolorist(36, 39);

function step(msg) {
    console.log(cyan(msg));
}
function errorStep(msg) {
    console.log(red(msg));
}
function info(msg) {
    console.log(cyan(msg));
}

function isEmptyDir(path) {
    var files = fs.readdirSync(path);
    return files.length === 0 || (files.length === 1 && files[0] === '.git');
}
function isExistsSync(path) {
    return fs.existsSync(path);
}
function emptyDirSync(dir) {
    if (!fs.existsSync(dir)) {
        return;
    }
    for (var _i = 0, _a = fs.readdirSync(dir); _i < _a.length; _i++) {
        var file = _a[_i];
        if (file === '.git') {
            continue;
        }
        fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
    }
}
function mkdirSync(path, options) {
    fs.mkdirSync(path, options);
}
function copyDir(srcDir, destDir) {
    fs.mkdirSync(destDir, { recursive: true });
    for (var _i = 0, _a = fs.readdirSync(srcDir); _i < _a.length; _i++) {
        var file = _a[_i];
        var srcFile = path.resolve(srcDir, file);
        var destFile = path.resolve(destDir, file);
        copy(srcFile, destFile);
    }
}
function copy(src, dest) {
    var stat = fs.statSync(src);
    if (stat.isDirectory()) {
        copyDir(src, dest);
    }
    else {
        fs.copyFileSync(src, dest);
    }
}

function importAsync(path) {
    return new Promise(function (resolve, reject) {
        import(path)
            .then(function (res) { return resolve(res); })
            .catch(function (err) {
            reject(err);
        });
    });
}
function add1(num1, num2) {
    return num1 + num2;
}

exports.add1 = add1;
exports.copy = copy;
exports.copyDir = copyDir;
exports.emptyDirSync = emptyDirSync;
exports.errorStep = errorStep;
exports.importAsync = importAsync;
exports.info = info;
exports.isEmptyDir = isEmptyDir;
exports.isExistsSync = isExistsSync;
exports.mkdirSync = mkdirSync;
exports.npm = npm;
exports.step = step;
