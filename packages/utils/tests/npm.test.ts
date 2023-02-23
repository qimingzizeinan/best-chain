import { it, describe, expect } from 'vitest'
import * as npm from '../src/npm'

describe('npm operation', () => {
  it('get latest version from npm ', async () => {
    const name = '1'
    try {
      const result = await npm.getNpmLatestSemverVersion('vitest', '1.0.0')
      console.log('', result)
    } catch (error) {
      console.log('error', error)
    }
    expect(1).toBe(1)
  })

  it.only('get npm package info', async () => {
    try {
      const result = await npm.getNpmInfo('vitest')
      console.log('result', result)
    } catch (error) {}
  })
})
