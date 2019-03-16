import type {Message} from 'discord.js'

/** A command that is triggered based on a regular expression. */
export default interface PinguRegexCommand {
  /**
   * The regex to test for.
   * If present, either `regexMessage` or `execute` must be defined.
   * If absent, `execute` must be defined.
   */
  regex?: RegExp

  /**
   * The message to reply with.
   * If present, `regex` must be defined.
   * If absent, `execute` must be defined.
   */
  regexMessage?: string

  /**
   * The actual command. Will only run if `regexMessage` or `regex` is not present.
   * If absent, `regex` and `regexMessage` must be defined.
   */
  execute?: (message: Message) => void
}
