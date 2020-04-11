import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/app-container.ts',
  output: {file: 'public/app-container.js', format: 'iife'},
  plugins: [nodeResolve(), typescript(), terser()]
}