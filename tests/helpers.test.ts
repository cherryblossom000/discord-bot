import {Client} from '../src/types'
import {reply} from '../src/helpers'
import {DMChannel, DMMessage, Guild, GuildMessage, TextChannel} from './mock'

describe('Helper functions', () => {
  describe('reply', () => {
    const client = new Client()
    const guild = new Guild(client)

    it('works for a guild channel', async () => {
      const channel = new TextChannel(guild)
      const message = new GuildMessage(channel)
      expect((await reply(message, 'test content')).content).toBe('test content')
    })

    it('works for a dm', async () => {
      const channel = new DMChannel(client)
      const message = new DMMessage(channel)
      expect((await reply(message, 'test content')).content).toBe('Test content')
    })
  })
})
