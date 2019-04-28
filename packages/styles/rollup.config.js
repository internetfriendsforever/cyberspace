import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default [{
  input: 'index.js',
  output: [
    {
      file: 'index.cjs.js',
      format: 'cjs'
    },
    {
      file: 'index.esm.js',
      format: 'esm'
    },
    {
      file: 'index.iife.js',
      format: 'iife',
      name: 'cyberspace.css'
    }
  ],

  plugins: [
    nodeResolve(),
    commonjs()
  ]
}]
