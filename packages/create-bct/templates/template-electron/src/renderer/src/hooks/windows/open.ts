export function useParentWindow() {
  let _win: Window | null = null

  function openWindow(url: string, target = '_blank', features?: any) {
    const win = window?.open(
      `/#${url}`,
      target,
      JSON.stringify(features),
    ) as Window
    _win = win
  }

  function postMessage(message: any) {
    _win?.postMessage(message)
  }

  function listenData(listenDataFromParentCb: (...args: any[]) => any) {
    window.addEventListener('message', e => {
      listenDataFromParentCb(e.data)
    })
  }

  return {
    listenData,
    postMessage,
    openWindow,
  }
}

export function useChildWindow(window: Window) {
  function listenData(listenDataFromParentCb: (...args: any[]) => any) {
    window?.addEventListener('message', e => {
      listenDataFromParentCb(e.data)
    })
  }

  function postMessage(message: any) {
    window?.opener?.postMessage(message)
  }

  return {
    postMessage,
    listenData,
  }
}

export function openWindowByMainProcess(
  name: string,
  path: string,
  config?: any,
) {
  window.electron.ipcRenderer.invoke('openWindow', {
    name,
    path,
    config,
  })
}
