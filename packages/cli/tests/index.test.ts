import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createCliConfig } from '../src/index'

describe('index.ts', () => {
  it('create cli config info', () => {
    const config = createCliConfig()
    const reulst = fileURLToPath(import.meta.url)
    // console.log('import.meta', import.meta)
    // console.log('reulst', reulst, import.meta)
  })
})
