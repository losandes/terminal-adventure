module.exports.name = 'Writer'
module.exports.dependencies = ['readline', 'stdin', 'stdout', 'Writable']
module.exports.factory = (readline, stdin, stdout, Writable) => {
  'use strict'

  const optionalOut = new Output()
  const rli = readline.createInterface({
    input: stdin,
    output: optionalOut,
    terminal: true
  })

  var self = {
    write: console.log,
    writeRaw: (chars) => { stdout.write(chars) },
    newLine: () => { console.log() },
    close: () => {
      return rli.close()
    },
    removeLastLine: () => {
      return readline.moveCursor(stdin, 0, -1) // remove the new line
    },
    removeLines: (numberOfLinesToRemove) => {
      readline.cursorTo(stdin, 0)                             // move to beginning of line
      readline.moveCursor(stdin, 0, -numberOfLinesToRemove)   // move to the top
      readline.clearScreenDown(stdin)                         // clear everything below
    },
    waitForAnswer: (options, callback) => {
      return new AnswerListener(options, callback)
    },
    on: (eventName, handler) => {
      return stdin.on(eventName, handler)
    },
    removeListener: (eventName, handler) => {
      return stdin.removeListener(eventName, handler)
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
          stdout.write(chunk, encoding)
        }

        callback()
      }
    })

    optionalOut.toggleHidden = (options) => {
      hidden = options && options.hidden
    }

    return optionalOut
  }
} // /factory
