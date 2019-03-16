import type {Snowflake} from './util'

export interface UserData {
  id: Snowflake
  username: string
  discriminator: string
  avatar: string | null
  bot?: boolean
}
