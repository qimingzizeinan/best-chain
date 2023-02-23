import { BrowserWindow, ipcMain, app } from 'electron'

export const windowManagerMap = new Map<string, WindowManager>()

export function addWindowManager(instance: WindowManager) {
  windowManagerMap.set(instance.getName(), instance)
}

export function getWindowManager(name: string) {
  return windowManagerMap.get(name)
}

export class WindowManager {
  name = ''
  windows: BrowserWindow | null = null
  constructor(name: string, windows: BrowserWindow) {
    this.name = name
    this.windows = windows
    this.listen()
    this.getName()
  }

  listen() {
    ipcMain.handle(this.rename('minimizeWindow'), () => {
      this.windows?.minimize()
    })

    ipcMain.handle(this.rename('maxmizeWindow'), () => {
      this.windows?.maximize()
    })

    ipcMain.handle(this.rename('unmaximizeWindow'), () => {
      this.windows?.unmaximize()
    })

    ipcMain.handle(this.rename('hideWindow'), () => {
      this.windows?.hide()
    })

    ipcMain.handle(this.rename('showWindow'), () => {
      this.windows?.show()
    })

    ipcMain.handle(this.rename('closeWindow'), () => {
      this.windows?.close()
    })
    ipcMain.handle(this.rename('resizable'), () => {
      return this.windows?.isResizable()
    })
    ipcMain.handle(this.rename('getPath'), (e, name: any) => {
      return app.getPath(name)
    })
  }

  private rename(name: string) {
    return `${this.name}:${name}`
  }

  getName() {
    console.log('getName', this.name)
    return this.name
  }
}
