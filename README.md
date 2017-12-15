Terminal Adventure
==================

![terminal-adventure](https://user-images.githubusercontent.com/933621/30776627-eef60938-a077-11e7-9d60-bdba67710411.gif)

Terminal Adventure is a Node.js library that offers promise-based prompts and menus in the terminal. I built it for teaching the following concepts, and typically use [Choose Your Own Adventure](https://en.wikipedia.org/wiki/Choose_Your_Own_Adventure) and bot formats to present examples and challenge students of all ages:

* NLP & Conversational UIs
* Decision, branch, and tree logic
* When and how to use JavaScript Promises

## Installation

```
npm install --save terminal-adventure
```

## Usage

### Prompts
In their simplest form, prompts ask questions in string form:

```JavaScript
const adventure = require('terminal-adventure')
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
```

We can also define questions as objects, to take advantage of some built in features. The following example requires an answer, and hides the input:

```JavaScript
const adventure = require('terminal-adventure')

adventure.question({
  question: 'Tell me a secret',
  required: true,
  hidden: true
}).then((answer) => {
  console.log('Sorry for this breach of trust. Hey everyone guess what:', answer)
  adventure.complete()
})
```

If you prefer not to validate in the `then`, you can add a `validate` function to the question, as in this example.

> Note that `validate` returns a validation message (of type, string) when the answer fails to pass validation, and that the question is always required when validation is present.

```JavaScript
const adventure = require('terminal-adventure')

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
```

If you'd like to present a default value for the user:

```JavaScript
const adventure = require('terminal-adventure')

adventure.question({
  question: 'Wanna skip this one? Just click enter.',
  defaultValue: 'no problem - there\'s a default'
}).then((answer) => {
  console.log('You chose:', answer)
  adventure.complete()
})
```

### Menus

> NOTE that the `menu` features do not work on Windows, only `question`

Terminal Adventure also supports single and multiple choice questions. This first example demonstrates a single choice question in it's simplest form:

> Use the up and down arrows to navigate. Press enter to select.

```JavaScript
const adventure = require('terminal-adventure')

adventure.menu('Choose one', ['One', 'Two', 'Three'])
  .then((answer) => {
    console.log('You chose:', answer)
    adventure.complete()
  })
```

The same choices can be presented as a multiple choice question by passing a third argument with `multipleChoice` set to `true`:

> Use the up and down arrows to navigate, the right arrow to select, and the left arrow to deselect. Press enter when you are finished.

```JavaScript
const adventure = require('terminal-adventure')

adventure.menu('Choose any', ['One', 'Two', 'Three'], { multipleChoice: true })
  .then((answer) => {
    console.log('You chose:', answer)
    adventure.complete()
  })
```

If you prefer custom values over number indexes, `menu` accepts key-value-pairs, as well as strings:

```JavaScript
const adventure = require('terminal-adventure')

adventure.menu(
  'Choose any',
  [{
    key: 'One',
    value: 'One'
  }, {
    key: 'Two',
    value: 'Two'
  }, {
    key: 'Three',
    value: 'Three'
  }],
  { multipleChoice: true }
).then((answer) => {
  console.log('You chose:', answer)
  adventure.complete()
})
```

### Chaining Questions & Building Forms
Since prompts and menus return Promises, we can chain them together to build forms. Each instance of an Adventure keeps a list of all answers, so you can wait until the end to use the results.

In this example, we return each question/menu from a function. At the end, we chain them together using `then`. At the end, our answers can be found on the form/adventure `answers` property.

> Note that in the following example, each question is able to build on the previous answer. The name you enter is used to ask if you like green eggs and ham. The answer to that question is used to decide whether or not to pre-select the choices in the last question.
>
> We could also use out-of-band answers by accessing `form.answers`

```JavaScript
const form = require('terminal-adventure')

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
    selected: likesThem
  },
  // ...
  {
    key: 'ANYWHERE!',
    value: 'ANYWHERE',
    selected: likesThem
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
```

### Multiple Adventures / Forms
All you need to do to start an adventure is require `terminal-adventure`. If you need more than one adventure, perhaps if you have multiple forms and wish to keep the answers separate, you can use the `Adventure` constructor that is exposed by the default instance:

```JavaScript
const Form = require('terminal-adventure').Adventure
const registration = new Form()
const preferences = new Form()

// ...
```

### Configuration
The messages, as well as the look and feel are configurable. Below is the default configuration:

```JavaScript
{
  pointer: {
    char: '▸',
    color: 'cyan'
  },
  unselected: {
    char: '◎',
    color: 'green'
  },
  selected: {
    char: '◉',
    color: 'cyan'
  },
  prompt: {
    char: '▸',
    color: 'cyan'
  },
  question: {
    format: (question, lastAnswerWasInvalid) => {
      if (lastAnswerWasInvalid) {
        return styles.red(`* ${question} ${styles.reset('(required)')}`)
      }
      return question
    },
    validationMessageColor: 'yellow'
  },
  messages: {
    chooseOne: 'Use the up and down arrows to navigate. Press enter to select.',
    chooseAny: 'Use the up and down arrows to navigate, the right arrow to select, and the left arrow to deselect. Press enter when you are finished.',
    cancel: 'cancelled'
  }
}
```

Use the `Adventure` constructor to configure your adventure. Note that the colors depend on [chalk](https://www.npmjs.com/package/chalk). You can use any of the colors, modifiers, or background colors.

```JavaScript
const Adventure = require('terminal-adventure').Adventure
const configured = new Adventure({
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
```

Colors can also be set to functions so you use custom styles:

```JavaScript
const chalk = require('chalk')
const Adventure = require('terminal-adventure').Adventure
const configured = new Adventure({
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
```
