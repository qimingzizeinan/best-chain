export * as npm from './npm'
export * from './log'
export * from './file'

export function importAsync(path: string) {
  return new Promise((resolve, reject) => {
    import(path)
      .then((res) => resolve(res))
      .catch((err) => {
        reject(err)
      })
  })
}

export function add1(num1: number, num2: number) {
  return num1 + num2
}
