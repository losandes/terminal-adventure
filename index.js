const readline = require('readline')
const chalk = require('chalk')
const stdin = process.stdin
const stdout = process.stdout
const Writable = require('stream').Writable

const styles = require('./src/Styles').factory(chalk)
const writer = require('./src/Writer').factory(readline, stdin, stdout, Writable)
const Menu = require('./src/Menu').factory(writer, styles)
const Question = require('./src/Question').factory(writer, styles)

module.exports = new Adventure()

function Adventure (config) {
  config = Object.assign({}, config)

  var adventure = {}
  const menu = new Menu(config, {
    addAnswer: addAnswer
  })
  const question = new Question(config, {
    addAnswer: addAnswer
  })

  var self = {
    Adventure: Adventure,
    menu: menu,
    question: question,
    close: close,
    complete: close
  }

  Object.defineProperty(self, 'answers', {
    configurable: false,
    enumerable: true,
    get: () => { return Object.assign({}, adventure) },
    set: (value) => {}
  })

  return self

  function close () {
    writer.close()
  }

  function addAnswer (question, answer, idx) {
    idx = typeof idx === 'number' ? idx : 0
    const q = idx > 0 ? `${question}_${idx}` : question

    if (adventure[q]) {
      return addAnswer(question, answer, idx + 1)
    }

    adventure[q] = answer
    return adventure
  }
}
