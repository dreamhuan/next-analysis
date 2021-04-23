const colors = require('colors')

const colorMapping = {
  info: 'green',
  warn: 'yellow',
  error: 'red',
  msg: 'blue',
}

const logger = Object.entries(colorMapping).reduce((acc, cur) => {
  const [k, v] = cur
  acc[k] = (...args) => {
    console.log(colors[v](args.reduce((a, b) => a + b)))
  }
  return acc
}, {})

module.exports = logger
