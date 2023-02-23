import { IpcRenderer } from 'electron'

export function useElectronUpdater(ipcRenderer: IpcRenderer) {
  function autoUpdate() {
    window.electron.ipcRenderer.send('checkForUpdate')
  }

  ipcRenderer.on('message', (event, data) => {
    console.log('message', data.msg)
  })
  ipcRenderer.on('downloadPress', (event, progressObj) => {
    // 自定义下载效果
    console.log('downloadPress', progressObj)
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcRenderer.on('isUpdateNow', (event, versionInfo) => {
    // 自定义选择效果, 自行表写
    autoUpdate()
  })

  onBeforeUnmount(() => {
    window.electron.ipcRenderer.removeAllListeners('checkForUpdate')
  })
}
