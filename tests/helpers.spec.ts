import {Client} from '../src/types'
import {reply} from '../src/helpers'
import {DMChannel, Guild, Message, TextChannel} from './mock'

describe('Helper functions', () => {
  describe('reply', () => {
    const client = new Client()
    const guild = new Guild(client)

    it('works for a guild channel', async () => {
      const channel = new TextChannel(guild)
      const message = new Message(channel)
      expect((await reply(message, 'test content')).content).toBe('test content')
    })

    it('works for a dm', async () => {
      const channel = new DMChannel(client)
      const message = new Message(channel)
      expect((await reply(message, 'test content')).content).toBe('Test content')
    })
  })
})
