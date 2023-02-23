/* eslint-disable @typescript-eslint/no-unused-vars */
import { IpcMain } from 'electron'
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { BrowserWindow } from 'electron'

// 更新地址
const updateURL = '服务端更新接口地址'
// 检测更新
export function handleUpdate(mainWindow: BrowserWindow, ipcMain: IpcMain) {
  // 通过main进程发送事件给renderer进程，提示更新信息
  function sendUpdateMessage(data) {
    mainWindow.webContents.send('message', data)
  }

  const message = {
    error: '检查更新出错',
    checking: '正在检查更新…',
    updateAva: '正在更新',
    updateNotAva: '已经是最新版本',
    downloadProgress: '正在下载...',
  }

  // 设置是否自动下载，默认是true,当点击检测到新版本时，会自动下载安装包，所以设置为false
  autoUpdater.autoDownload = false

  autoUpdater.setFeedURL(updateURL)

  autoUpdater.on('error', function (e) {
    log.warn('error', e)
    sendUpdateMessage({ cmd: 'error', message: message.error })
  })

  autoUpdater.on('checking-for-update', function () {
    log.warn(message.checking)
    sendUpdateMessage({ cmd: 'checking-for-update', message: message.checking })
  })

  autoUpdater.on('update-available', function (info) {
    log.warn(message.updateAva)
    sendUpdateMessage({
      cmd: 'update-available',
      message: message.updateAva,
      info,
    })
  })

  autoUpdater.on('update-not-available', function (info) {
    log.warn(message.updateNotAva)
    sendUpdateMessage({
      cmd: 'update-not-available',
      message: message.updateNotAva,
      info: info,
    })
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', function (progressObj) {
    log.warn('触发下载。。。')
    log.warn(progressObj)
    sendUpdateMessage({
      cmd: 'downloadProgress',
      message: message.downloadProgress,
      progressObj,
    })
  })

  autoUpdater.on(
    'update-downloaded',
    function (
      _event,
      _releaseNotes,
      _releaseName,
      _releaseDate,
      _updateUrl,
      _quitAndUpdate,
    ) {
      // ipcMain.on('isUpdateNow', (e, arg) => {
      log.warn('开始更新')
      autoUpdater.quitAndInstall()
      mainWindow.destroy()
      // callback()
      // })
      // sendUpdateMessage({ cmd: 'isUpdateNow', message: null })
    },
  )

  ipcMain.on('checkForUpdate', () => {
    log.warn('执行自动更新检查')
    autoUpdater.checkForUpdates()
  })

  ipcMain.on('downloadUpdate', () => {
    log.warn('执行下载')
    autoUpdater.downloadUpdate()
  })
}
