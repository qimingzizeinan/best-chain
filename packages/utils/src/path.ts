import path from 'path'

export function transformPath(url: string) {
  const sep = path.sep
  // 如果返回 / 则为 macOS
  if (sep === '/') {
    return url
  } else {
    return url.replace(/\\/g, '/')
  }
}
