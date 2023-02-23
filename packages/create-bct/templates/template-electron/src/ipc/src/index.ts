import { IpcMain } from 'electron'

// ================= ipcMain =================
let _ipcMain: IpcMain | null = null

export function ipcMainInit(instance: IpcMain) {
  _ipcMain = instance
  mainHandlesInit()
}

export function mainHandlesInit() {
  _ipcMain?.handle('testInvoke', (e, data) => {
    console.log('e======', data)
  })
}

// ================= ipcRenderer =================

let _ipcRenderer: any = null

export function rendererInit(ipcRenderer: any) {
  _ipcRenderer = ipcRenderer
  invokeI()
}

export function invokeI() {
  _ipcRenderer?.invoke('testInvoke', { a: '1' })
}
