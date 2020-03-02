import {Client} from 'discord.js'
import mockConsole from 'jest-mock-console'
import {logDate, reply} from '../src/helpers'
import {DMChannel, Guild, Message, TextChannel} from './mock'

declare const console: Console & {log: {mock: {calls: any[]}}}

describe('Helper functions', () => {
  describe('logDate', () => {
    it('works', () => {
      const date = new Date()
      const restoreConsole = mockConsole('log')
      logDate()
      expect(console.log.mock.calls).toEqual([[date.toLocaleString()]])
      restoreConsole()
    })
  })

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
