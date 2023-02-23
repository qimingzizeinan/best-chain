import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  ipcMain,
} from 'electron'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  addWindowManager,
  getWindowManager,
  WindowManager,
} from '@main/managers/window'
import { merge } from 'lodash-es'
import { ipcMainInit } from '@ipc/index'
import { handleUpdate } from './src/Updater'
import log from 'electron-log'

// 初始化主进程的ipc
ipcMainInit(ipcMain)

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

const baseWindowConfig = {
  windowConfig: {
    width: 960,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png'),
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      webSecurity: true,
      nodeIntegration: true,
      sandbox: false,
      allowRunningInsecureContent: true,
      webviewTag: true,
      spellcheck: false,
      disableHtmlFullscreenWindowResize: true,
    },
  },
}

function createWindow(name: string, url: string, config?: any): BrowserWindow {
  log.info(
    `create Window: ${name}. page url: ${url}. config: ${JSON.stringify(
      config,
    )}`,
  )
  let windowConfig: BrowserWindowConstructorOptions | undefined = undefined
  if (config) {
    if (config.windowConfig) windowConfig = config.windowConfig
  }
  // Create the browser window.
  const window = new BrowserWindow(windowConfig)

  window.on('ready-to-show', () => {
    window.show()
  })

  window.webContents.setWindowOpenHandler(details => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: merge(
        {},
        baseWindowConfig,
        details.features,
      ),
    }
  })

  window.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } })
    },
  )

  window.webContents.session.webRequest.onHeadersReceived(
    (details, callback) => {
      callback({
        responseHeaders: {
          'Access-Control-Allow-Origin': ['*'],
          ...details.responseHeaders,
        },
      })
    },
  )

  if (!getWindowManager(name)) {
    addWindowManager(new WindowManager(name, window))
  }

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    let pagePath = process.env['ELECTRON_RENDERER_URL']
    if (pagePath) {
      pagePath = pagePath + '#' + url
    }

    window.loadURL(pagePath)
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'), {
      hash: url ?? '',
    })
  }

  return window
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  let mainWindow = createWindow('main', '/main', baseWindowConfig)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0)
      mainWindow = createWindow('main', '/main', baseWindowConfig)
  })

  // 应用检查更新
  handleUpdate(mainWindow, ipcMain)
})

// 打开窗口监听
ipcMain.handle('openWindow', (_, args) => {
  const { name, path, config } = args
  createWindow(name, path, merge({}, baseWindowConfig, config))
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
