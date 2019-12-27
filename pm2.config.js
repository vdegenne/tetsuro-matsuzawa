module.exports = {
  apps: [
    {
      name: 'memory',
      script: '.',
      interpreter: 'es-dev-server',
      interpreter_args: '--node-resolve -r public --babel --file-extensions .ts -p 43789 --preserve-symlinks'
    }
  ]
}
