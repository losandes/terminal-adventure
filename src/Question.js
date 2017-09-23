module.exports.name = 'Menu'
module.exports.dependencies = ['writer', 'chalk']
module.exports.factory = (writer, styles) => {
  'use strict'

  return Question

  function Question (cfg, adventure) {
    var config = {}
    cfg = Object.assign({}, cfg)

    config.prompt = Object.assign({ char: '▸', color: 'cyan' }, cfg.prompt)
    config.messages = Object.assign({ cancel: 'cancelled' }, cfg.messages)
    config.question = Object.assign({
      format: (question, lastAnswerWasInvalid) => {
        if (lastAnswerWasInvalid) {
          return styles.red(`* ${question} ${styles.reset('(required)')}`)
        }
        return question
      },
      validationMessageColor: 'yellow'
    }, cfg.question)

    return (q) => {
      const question = new OneQuestion(q)

      return new Promise((resolve, reject) => {
        const handlers = {
          escape: cancel
        }

        writer.on('keypress', keypress)
        prompt()

        function prompt (lastAnswerWasInvalid, message) {
          writer.write(config.question.format(question.question, lastAnswerWasInvalid))

          if (message) {
            writer.write(styles.applyColor(config.question.validationMessageColor, message))
          }

          writer.writeRaw(` ${styles.applyColor(config.prompt.color, config.prompt.char)} `)
          writer.waitForAnswer(question, function (err, answer) {
            if (err) {
              return reject(err)
            }

            if (question.required && (!answer || answer === '')) {
              writer.removeLines(1)
              return prompt(true)
            }

            const validationMessage = question.validate && question.validate(answer)

            if (typeof validationMessage === 'string') {
              // validate returned a validation message
              writer.removeLines(message ? 3 : 2)
              return prompt(true, validationMessage)
            } else if (question.validate && validationMessage === false) {
              // validate returned false
              writer.removeLines(message ? 3 : 2)
              return prompt(true)
            }

            adventure.addAnswer(question.key, answer)
            resolve(answer)
            close()
          })
        }

        function keypress (ignored, key) {
          if (key && typeof handlers[key.name] === 'function') {
            return handlers[key.name]()
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
        }
      }) // /Promise
    } // /prompt
  } // /Menu

  function OneQuestion (q) {
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
    self.required = typeof q.required === 'boolean' ? q.required : false
    self.validate = typeof q.validate === 'function' ? q.validate : null
    self.hidden = typeof q.hidden === 'boolean' ? q.hidden : false

    return self
  }
}
