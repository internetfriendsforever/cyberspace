import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default [{
  input: 'index.js',
  output: [
    {
      file: 'dist/cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/esm.js',
      format: 'esm'
    },
    {
      file: 'dist/iife.js',
      format: 'iife',
      name: 'cyberspace.css'
    }
  ],

  plugins: [
    nodeResolve(),
    commonjs()
  ]
}]
