import fetch from 'node-fetch'
import {checkPermissions} from '../utils.js'
import type {AnyCommand} from '../types'

const randomDog = 'https://random.dog/'

const command: AnyCommand = {
  name: 'dog',
  aliases: ['d', 'randomdog'],
  description: 'Gets a random image of a dog from random.dog.',
  async execute(message) {
    if (
      message.guild &&
      !(await checkPermissions(message, ['ATTACH_FILES', 'EMBED_LINKS']))
    )
      return
    await message.channel.send({
      embed: {
        image: {
          url:
            randomDog +
            (await (await fetch(`${randomDog}woof?filter=mp4`)).text())
        },
        footer: {text: 'Provided by random.dog.'}
      }
    })
  }
}
export default command
