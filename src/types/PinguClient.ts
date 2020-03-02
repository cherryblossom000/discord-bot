import {Client, Collection} from 'discord.js'
import PinguCommand from './PinguCommand'

/** The Discord client for this bot. */
export default class PinguClient extends Client {
  /** The commands. */
  commands = new Collection<string, PinguCommand>()

  /** Set the activity. */
  setActivity(): void {
    this.user!.setActivity(`capitalist scum in ${this.guilds.cache.size} servers`, {type: 'WATCHING'})
  }
}
