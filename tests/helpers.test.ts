import {Client} from '../src/types'
import {reply} from '../src/helpers'
import {DMChannel, DMMessage, Guild, GuildMessage, TextChannel} from './mock'
import type {Message} from '../src/types'

describe('Helper functions', () => {
  describe('reply', () => {
    const client = new Client()
    const guild = new Guild(client)

    it('works for a guild channel', async () => {
      const channel = new TextChannel(guild)
      const message = new GuildMessage(channel)
      await reply(message as Message, 'test content')
      expect(channel.lastMessage?.content).toBe('test content')
    })

    it('works for a dm', async () => {
      const channel = new DMChannel(client)
      const message = new DMMessage(channel)
      await reply(message, 'test content')
      expect(channel.lastMessage?.content).toBe('Test content')
    })
  })
})
