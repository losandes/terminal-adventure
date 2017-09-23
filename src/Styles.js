module.exports.name = 'Menu'
module.exports.dependencies = ['chalk']
module.exports.factory = (chalk) => {
  'use strict'

  function applyColor (color, text) {
    if (typeof color === 'string') {
      return chalk[color](text)
    } else if (typeof color === 'function') {
      return color(text)
    } else {
      return text
    }
  }

  chalk.applyColor = applyColor

  return chalk
}
