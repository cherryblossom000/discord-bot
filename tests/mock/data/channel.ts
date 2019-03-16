import type {Snowflake, Timestamp} from './util'
import type {PermissionsFlags} from './permissions'
import type {UserData} from './user'

export const enum ChannelType {
  GUILD_TEXT,
  DM,
  GUILD_VOICE,
  GROUP_DM,
  GUILD_CATEGORY,
  GUILD_NEWS,
  GUILD_STORE
}

interface _ChannelData {
  id: Snowflake
  type: ChannelType
}

interface _TextChannelData extends _ChannelData {
  type: typeof ChannelType['DM' | 'GROUP_DM' | 'GUILD_TEXT']
  last_message_id: Snowflake | null
  last_pin_timestamp?: Timestamp
}

interface _DMChannelData extends _TextChannelData {
  type: typeof ChannelType['DM' | 'GROUP_DM']
  recipients: UserData[]
}
export interface DMChannelData extends _DMChannelData {type: ChannelType.DM}

interface GroupDMChannelData extends _DMChannelData {
  type: ChannelType.GROUP_DM
  name?: string
  icon: string | null
  owner_id?: Snowflake
  application_id?: Snowflake
}

export interface GuildChannelData extends _ChannelData {
  type: typeof ChannelType['GUILD_TEXT' | 'GUILD_VOICE' | 'GUILD_CATEGORY' | 'GUILD_NEWS' | 'GUILD_STORE']
  position?: number
  permission_overwrites?: {
    id: Snowflake
    type: 'role' | 'member'
    allow: PermissionsFlags
    deny: PermissionsFlags
  }[]
  name?: string
  parent_id?: Snowflake
}

export interface TextChannelData extends GuildChannelData, _TextChannelData {
  type: ChannelType.GUILD_TEXT
  topic?: string | null
  nsfw?: boolean
  rate_limit_per_user?: number
}

interface VoiceChannelData extends GuildChannelData {
  type: ChannelType.GUILD_VOICE
  bitrate?: number
  user_limit?: number
}

interface CategoryChannelData extends GuildChannelData {type: ChannelType.GUILD_CATEGORY}
interface NewsChannelData extends GuildChannelData {type: ChannelType.GUILD_NEWS}

interface StoreChannelData extends GuildChannelData {
  type: ChannelType.GUILD_STORE
  nsfw?: boolean
}

export type ChannelData = DMChannelData
| GroupDMChannelData
| TextChannelData
| VoiceChannelData
| CategoryChannelData
| NewsChannelData
| StoreChannelData
