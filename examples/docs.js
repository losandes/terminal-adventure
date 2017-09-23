const chalk = require('chalk')

module.exports = function (adventure) {
  const simplePromptExample = () => {
    const correctAnswers = ['42', 'forty-two', 'forty two', 'fourty-two', 'fourty two']

    adventure.question('What is the Answer to the Ultimate Question of Life, The Universe, and Everything?')
      .then((answer) => {
        if (correctAnswers.indexOf(answer) > -1) {
          console.log('Correct!')
          adventure.complete()
        } else {
          console.log('That\'s riveting. Thank you for that. Really, I\'m speechless. However the correct answer is, 42')
          adventure.complete()
        }
      })
  }

  const requiredAndHidden = () => {
    adventure.question({
      question: 'Tell me a secret',
      required: true,
      hidden: true
    }).then((answer) => {
      console.log('Sorry for this breach of trust. Hey everyone guess what:', answer)
      adventure.complete()
    })
  }

  const validation = () => {
    adventure.question({
      question: 'What is the Answer to the Ultimate Question of Life, The Universe, and Everything?',
      validate: (answer) => {
        if (answer.trim() !== '42') {
          return 'Sorry, try again (hint: the answer is a number between 40 and 50)'
        }
      }
    }).then((answer) => {
      console.log('Correct!')
      adventure.complete()
    })
  }

  const simpleSingleChoice = () => {
    adventure.menu('Choose one', ['One', 'Two', 'Three'])
      .then((answer) => {
        console.log('You chose:', answer)
        adventure.complete()
      })
  }

  const simpleMultipleChoice = () => {
    adventure.menu('Choose any', ['One', 'Two', 'Three'], { multipleChoice: true })
      .then((answers) => {
        console.log('You chose:', answers)
        adventure.complete()
      })
  }

  const kvpChoice = () => {
    adventure.menu(
      'Do you like cake?',
      [{
        key: 'Yes',
        value: true
      }, {
        key: 'No',
        value: false
      }]
    ).then((answer) => {
      console.log('You chose:', answer)
      adventure.complete()
    })
  }

  const formExample = () => {
    const form = new adventure.Adventure()

    const name = () => {
      return form.question({
        key: 'name',
        question: 'What is your name?'
      })
    }

    const likesGreenEggsAndHam = (name) => {
      return form.menu({
        key: 'likesGreenEggsAndHam',
        question: 'Do you like green eggs and ham?'
      }, [{
        key: `I do so like green eggs and ham! Thank you! Thank you, ${name}!`,
        value: true
      }, {
        key: `I do not like them, ${name}. I do not like green eggs and ham.`,
        value: false
      }])
    }

    const whereWouldYouEatThem = (likesThem) => {
      return form.menu({
        key: 'places',
        question: 'Where would you eat green eggs and ham?'
      }, [{
        key: 'In a boat',
        value: 'BOAT',
        selected: likesThem.value
      }, {
        key: 'With a goat',
        value: 'GOAT',
        selected: likesThem.value
      }, {
        key: 'In the rain',
        value: 'RAIN',
        selected: likesThem.value
      }, {
        key: 'In the dark',
        value: 'DARK',
        selected: likesThem.value
      }, {
        key: 'On a train',
        value: 'TRAIN',
        selected: likesThem.value
      }, {
        key: 'In a car',
        value: 'CAR',
        selected: likesThem.value
      }, {
        key: 'In a tree',
        value: 'TREE',
        selected: likesThem.value
      }, {
        key: 'In a box',
        value: 'BOX',
        selected: likesThem.value
      }, {
        key: 'With a fox',
        value: 'FOX',
        selected: likesThem.value
      }, {
        key: 'In a house',
        value: 'HOUSE',
        selected: likesThem.value
      }, {
        key: 'With a mouse',
        value: 'MOUSE',
        selected: likesThem.value
      }, {
        key: 'here and there',
        value: 'HERE_AND_THERE',
        selected: likesThem.value
      }, {
        key: 'ANYWHERE!',
        value: 'ANYWHERE',
        selected: likesThem.value
      }], {
        multipleChoice: true
      })
    }

    name()
      .then(likesGreenEggsAndHam)
      .then(whereWouldYouEatThem)
      .then((answer) => {
        console.log('\nYour answers:')
        console.log(form.answers)

        form.complete()
      })
  }

  const configure = () => {
    const configured = new adventure.Adventure({
      pointer: { char: '>', color: 'white' },
      unselected: { char: '☐' },
      selected: { char: '☑' },
      prompt: { char: '>', color: 'white' },
      question: {
        validationMessageColor: 'dim'
      }
    })

    const meaningOfLife = () => {
      return configured.question({
        question: 'What is the Answer to the Ultimate Question of Life, The Universe, and Everything?',
        validate: (answer) => {
          if (answer.trim() !== '42') {
            return 'Sorry, try again (hint: the answer is a number between 40 and 50)'
          }
        }
      })
    }

    const yesOrNo = () => {
      return configured.menu('Choose any', ['One', 'Two', 'Three'], { multipleChoice: true })
        .then((answers) => {
          console.log('You chose:', answers)
        })
    }

    meaningOfLife()
      .then(yesOrNo)
      .then((answer) => {
        console.log('Your answers:')
        console.log(configured.answers)

        configured.complete()
      })
  }

  const configureColorWithFunc = () => {
    const configured = new adventure.Adventure({
      question: {
        validationMessageColor: function (message) {
          return chalk.italic.black.bgYellow(` ${message} `)
        }
      }
    })

    configured.question({
      question: 'What is the Answer to the Ultimate Question of Life, The Universe, and Everything?',
      validate: (answer) => {
        if (answer.trim() !== '42') {
          return 'Sorry, try again (hint: the answer is a number between 40 and 50)'
        }
      }
    }).then((answer) => {
      console.log('Your answered:', answer)

      configured.complete()
    })
  }

  adventure.menu('\nChoose an example', [
    'Simple Prompt',
    'Required and Hidden Prompt',
    'Validated Prompt',
    'Simple Single Choice',
    'Simple Multiple Choice',
    'Key-Value-Pair Choice',
    'Chainability & Forms',
    'Configuration',
    'Configure Color With Function'
  ]).then((answer) => {
    switch (answer.key) {
      case 'Simple Prompt':
        return simplePromptExample()
      case 'Required and Hidden Prompt':
        return requiredAndHidden()
      case 'Validated Prompt':
        return validation()
      case 'Simple Single Choice':
        return simpleSingleChoice()
      case 'Simple Multiple Choice':
        return simpleMultipleChoice()
      case 'Key-Value-Pair Choice':
        return kvpChoice()
      case 'Chainability & Forms':
        return formExample()
      case 'Configuration':
        return configure()
      case 'Configure Color With Function':
        return configureColorWithFunc()
    }
  })
}
