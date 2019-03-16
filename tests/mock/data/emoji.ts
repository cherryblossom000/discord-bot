import type {Snowflake} from './util'

export interface EmojiData {
  id: Snowflake | null
  name: string | null
  require_colons?: boolean
  managed?: boolean
  animated?: boolean
}
