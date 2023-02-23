import { red, blue, green, cyan } from 'kolorist'

export function step(msg: string) {
  console.log(cyan(msg))
}

export function errorStep(msg: string) {
  console.log(red(msg))
}

export function info(msg: string) {
  console.log(cyan(msg))
}
