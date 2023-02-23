import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import externals from 'rollup-plugin-node-externals'
import clear from 'rollup-plugin-clear'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'

const plugins = []

if (process.env.production) {
  plugins.push(terser())
}

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    },
    plugins: [
      externals({
        check: false,
        exclude: []
      }),
      resolve(),
      commonjs(),
      typescript({
        check: false,
        useTsconfigDeclarationDir: true
      }),

      clear({ targets: ['dist'] }),
      json()
    ].concat(plugins),
    external: []
  }
]
