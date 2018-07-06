module.exports.name = 'Writer'
module.exports.dependencies = ['readline', 'stdin', 'stdout', 'Writable']
module.exports.factory = (readline, stdin, stdout, Writable) => {
  'use strict'

  const inputSteam = () => {
    return stdin
  }
  const outputStream = () => {
    return stdout
  }

  const optionalOut = new Output()
  const rli = readline.createInterface({
    input: inputSteam(),
    output: optionalOut,
    terminal: true
  })

  var self = {
    write: console.log,
    writeRaw: (chars) => { outputStream().write(chars) },
    newLine: () => { console.log() },
    close: () => {
      return rli.close()
    },
    removeLastLine: () => {
      return readline.moveCursor(outputStream(), 0, -1) // remove the new line
    },
    removeLines: (numberOfLinesToRemove) => {
      readline.cursorTo(outputStream(), 0)                             // move to beginning of line
      readline.moveCursor(outputStream(), 0, -numberOfLinesToRemove)   // move to the top
      readline.clearScreenDown(outputStream())                         // clear everything below
    },
    waitForAnswer: (options, callback) => {
      return new AnswerListener(options, callback)
    },
    on: (eventName, handler) => {
      return inputSteam().on(eventName, handler)
    },
    removeListener: (eventName, handler) => {
      return inputSteam().removeListener(eventName, handler)
    }
  } // /return

  return self

  function AnswerListener (options, callback) {
    var completed = false
    optionalOut.toggleHidden(options)
    const handler = (line) => {
      if (completed) {
        rli.removeListener('line', handler)
        return
      }

      if (typeof callback === 'function') {
        callback(null, line.trim())
      }

      completed = true
      rli.removeListener('line', handler)
    }

    rli.on('line', handler)
    return rli
  }

  function Output () {
    var hidden = false

    var optionalOut = new Writable({
      write: (chunk, encoding, callback) => {
        if (!hidden) {
          outputStream().write(chunk, encoding, callback)
        } else {
          callback()
        }
      }
    })

    optionalOut.toggleHidden = (options) => {
      hidden = options && options.hidden
    }

    optionalOut.isHidden = () => hidden

    return optionalOut
  }
} // /factory
