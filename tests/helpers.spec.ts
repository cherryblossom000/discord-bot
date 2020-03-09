import {Client} from 'discord.js'
import {reply} from '../src/helpers'
import {DMChannel, Guild, Message, TextChannel} from './mock'

describe('Helper functions', () => {
  describe('reply', () => {
    const client = new Client()
    const guild = new Guild(client)

    it('works for a guild channel', () => {
      const channel = new TextChannel(guild)
      const message = new Message(channel)
      reply(message, 'test content')
      expect(channel.lastMessage?.content).toBe('test content')
    })

    it('works for a dm', () => {
      const channel = new DMChannel(client)
      const message = new Message(channel)
      reply(message, 'test content')
      expect(channel.lastMessage?.content).toBe('Test content')
    })
  })
})
