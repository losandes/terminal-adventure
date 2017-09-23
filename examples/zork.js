const Adventure = require('../index.js').Adventure

module.exports = function Zork () {
  const zork = new Adventure()

  var mailbox = {
    open: false,
    leaflet: true
  }

  const setting = zork.question(`
Zork I: The Great Underground Empire
Copywrite (c) 1981, 1982, 1983 Infocom, Inc. All rights reserved
Zork is a registered trademark of Infocom, Inc.

West of House
You are standing in an open field west of a white house, with a boarded front door
There is a small mailbox here`)

  const mailboxActions = (answer) => {
    switch (answer) {
      case 'examine mailbox':
        if (mailbox.open && mailbox.leaflet) {
          return zork.question('The small mailbox is open, and contains a leaflet')
            .then(mailboxActions)
        } else if (mailbox.open) {
          return zork.question('The small mailbox is open, and empty')
            .then(mailboxActions)
        } else {
          return zork.question('The small mailbox is closed')
            .then(mailboxActions)
        }
      case 'open mailbox':
        if (mailbox.open) {
          return zork.question('The mailbox is already open')
            .then(mailboxActions)
        } else {
          mailbox.open = true
          return zork.question('Opening the small mailbox reveals a leaflet')
            .then(mailboxActions)
        }
      case 'close mailbox':
        if (mailbox.open && !mailbox.leaflet) {
          return
        } else if (!mailbox.open) {
          return zork.question('The mailbox is already closed')
            .then(mailboxActions)
        } else {
          mailbox.open = false
          return zork.question('The mailbox is closed')
            .then(mailboxActions)
        }
      case 'get leaflet':
        mailbox.leaflet = false
        return zork.question('Taken')
          .then(mailboxActions)
      default:
        return zork.question(`I don't understand "${answer}"`)
          .then(mailboxActions)
    }
  }

  setting
    .then(mailboxActions)
    .then((answer) => {
      console.log('The End')
      zork.complete()
    }).catch((err) => {
      console.log(err)
      zork.complete()
    })
}
