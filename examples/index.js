const adventures = require('../index.js')
const Zork = require('./zork.js')
const Docs = require('./docs.js')

adventures.menu('\nChoose an adventure', ['Examples from Readme', 'Zork'])
  .then((answer) => {
    switch (answer.key) {
      case 'Zork':
        return new Zork()
      default:
        return new Docs(adventures)
    }
  })
