module.exports.name = 'Menu'
module.exports.dependencies = ['writer', 'chalk']
module.exports.factory = (writer, styles) => {
  'use strict'

  const CURSOR = '[?25h'
  const HIDDEN_CURSOR = '[?25l'

  return Menu

  function Menu (cfg, adventure) {
    var config = {}
    cfg = Object.assign({}, cfg)

    config.pointer = Object.assign({ char: '▸', color: 'cyan' }, cfg.pointer)
    config.unselected = Object.assign({ char: '◎', color: 'green' }, cfg.unselected)
    config.selected = Object.assign({ char: '◉', color: 'cyan' }, cfg.selected)
    config.messages = Object.assign({
      chooseOne: 'Use the up and down arrows to navigate. Press enter to select.',
      chooseAny: 'Use the up and down arrows to navigate, the right arrow to select, and the left arrow to deselect. Press enter when you are finished.',
      cancel: 'cancelled'
    }, cfg.messages)

    return (q, ch, opts) => {
      const question = new Question(q)
      const choices = new Choices(ch)
      const originalSelection = new OriginalSelection(ch)
      const options = new Options(opts)

      return new Promise((resolve, reject) => {
        var position = 0
        var selected = [-1]

        if (originalSelection.length) {
          selected = originalSelection
        }

        const handlers = {
          up: up,
          down: down,
          right: right,
          left: left,
          return: () => {
            writer.removeLastLine()
            choose()
          },
          escape: cancel
        }

        writer.on('keypress', keypress)
        writer.write(question.question)
        if (options.multipleChoice) {
          writer.write(`${styles.dim.italic(config.messages.chooseAny)}\n`)
        } else {
          writer.write(`${styles.dim.italic(config.messages.chooseOne)}\n`)
        }
        render()
        writer.waitForAnswer({ hidden: true })

        function keypress (ignored, key) {
          if (key && typeof handlers[key.name] === 'function') {
            return handlers[key.name]()
          }
        }

        function choose () {
          if (options.multipleChoice) {
            let answer = choices.filter((choice, idx) => {
              return selected.indexOf(idx) > -1
            })
            adventure.addAnswer(question.key, answer)
            resolve(answer)
            close()
          } else {
            selected[0] = position
            writer.newLine()
            rerender()
            let answer = choices[position]
            adventure.addAnswer(question.key, answer)
            resolve(answer)
            close()
          }
        }

        function cancel () {
          resolve({
            key: config.messages.cancel,
            value: -1
          })
          close()
        }

        function close () {
          writer.newLine()
          writer.removeListener('keypress', keypress)
          writer.writeRaw(encode(CURSOR))
        }

        function indexIsSelected (idx) {
          return selected.indexOf(idx) > -1
        }

        function render (clear) {
          choices.forEach((choice, idx) => {
            let pointerText = position === idx ? styles.applyColor(config.pointer.color, config.pointer.char)
              : styles.hidden(config.pointer.char)
            let bullet = indexIsSelected(idx) ? config.selected : config.unselected
            let bulletText = styles.applyColor(bullet.color, bullet.char)
            let text = position === idx ? choice.key : styles.dim(choice.key)
            text = indexIsSelected(idx) ? styles.bold.italic(text) : text
            writer.write(` ${pointerText} ${bulletText} ${text}`)
            writer.writeRaw(encode(HIDDEN_CURSOR))
          })
        }

        function clear () {
          writer.removeLines(choices.length)
        }

        function rerender () {
          clear()
          render()
        }

        function up () {
          if (position > 0) {
            position -= 1
          }

          rerender()
        }

        function down () {
          if (position < (choices.length - 1)) {
            position += 1
          }

          rerender()
        }

        function right () {
          if (!options.multipleChoice) {
            return
          }

          if (selected[0] === -1) {
            selected.shift()
          }

          if (selected.indexOf(position) === -1) {
            selected.push(position)
          }

          rerender()
        }

        function left () {
          if (!options.multipleChoice) {
            return
          }

          selected.forEach((pos, idx) => {
            if (pos === position) {
              selected.splice(idx, 1)
            }
          })

          if (!selected.length) {
            selected.push(-1)
          }

          rerender()
        }
      }) // /Promise
    } // /prompt
  } // /Menu

  function Question (q) {
    var self = {}

    if (typeof q === 'string') {
      q = Object.assign({}, { question: q })
    } else if (!q || typeof q.question !== 'string') {
      throw new Error('A question is required')
    } else {
      q = Object.assign({}, q)
    }

    self.question = q.question
    self.key = q.key || q.question

    return self
  }

  function Choices (choices) {
    if (!Array.isArray(choices)) {
      throw new Error('menu.prompt requires an array of choices')
    }

    return choices.map((choice, i) => {
      let key
      let value

      if (typeof choice === 'string') {
        key = choice
        value = i
      } else if (choice && typeof choice.key === 'string') {
        key = choice.key
        value = typeof choice.value !== 'undefined' && choice.value !== null ? choice.value : i
      } else {
        throw new Error('Choices must either be a string, or an object with `key` and `value` properties')
      }

      return {
        key: key,
        value: value
      }
    })
  }

  function OriginalSelection (choices) {
    return choices.map((choice, idx) => {
      if (choice && typeof choice.key === 'string') {
        return {
          selected: typeof choice.selected === 'boolean' ? choice.selected : false,
          idx: idx
        }
      }

      return {
        selected: false,
        idx: idx
      }
    }).filter(choice => {
      return choice.selected
    }).map(choice => {
      return choice.idx
    })
  }

  function Options (options) {
    return Object.assign({ multipleChoice: false }, options)
  }

  function encode (input) {
    const bytes = makeBytes(input)
    return Buffer.from([ 0x1b ].concat(bytes))
  }

  function makeBytes (input) {
    if (typeof input === 'string') {
      return input.split('').map((char) => {
        return char.charCodeAt(0)
      })
    } else if (Array.isArray(input)) {
      return input.reduce((prev, current) => {
        return prev.concat(makeBytes(current))
      }, [])
    }
  }
}
