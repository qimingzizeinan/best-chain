import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import externals from 'rollup-plugin-node-externals'
import clear from 'rollup-plugin-clear'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
// import { swc } from 'rollup-plugin-swc3'
import json from '@rollup/plugin-json'

const plugins = []

if (process.env.production) {
  plugins.push(terser())
}

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs'
    },
    plugins: [
      externals({
        check: false,
        exclude: ['url-join']
      }),
      resolve(),
      commonjs(),
      typescript({
        check: false,
        useTsconfigDeclarationDir: true
      }),
      // swc({
      //   jsc: {
      //     parser: {
      //       syntax: 'typescript',
      //       // tsx: true, // If you use react
      //       dynamicImport: true,
      //       decorators: true
      //     },
      //     target: 'es2021',
      //     transform: {
      //       decoratorMetadata: true
      //     }
      //   }
      // }),
      clear({ targets: ['dist'] }),
      json()
    ].concat(plugins),
    external: []
  }
]
