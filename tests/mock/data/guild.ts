import type {Snowflake, Timestamp} from './util'
import type {ChannelData} from './channel'
import type {EmojiData} from './emoji'
import type {PermissionsFlags} from './permissions'
import type {UserData} from './user'

export const enum VerificationLevel {
  NONE,
  LOW,
  MEDIUM,
  HIGH,
  VERY_HIGH
}

export const enum DefaultMessageNotificationLevel {ALL_MESSAGES, ONLY_MENTIONS}

export const enum ExplicitContentFilterLevel {
  DISABLED,
  MEMBERS_WITHOUT_ROLES,
  ALL_MEMBERS
}

export const enum MFALevel {NONE, ELEVATED}

export interface GuildData {
  id: Snowflake
  name: string
  icon: string | null
  splash: string | null
  owner_id: Snowflake
  region: string
  afk_channel_id: Snowflake | null
  afk_timeout: number
  embed_enabled?: boolean
  verification_level: VerificationLevel
  default_message_notifications: DefaultMessageNotificationLevel
  explicit_content_filter: ExplicitContentFilterLevel
  roles: {
    id: Snowflake
    name: string
    color: number
    hoist: boolean
    position: number
    permissions: PermissionsFlags
    managed: boolean
    mentionable: boolean
  }[]
  emojis: (EmojiData & {name: string})[]
  features: (
    'INVITE_SPLASH' |
    'VIP_REGIONS' |
    'VANITY_URL' |
    'VERIFIED' |
    'PARTNERED' |
    'PUBLIC' |
    'COMMERCE' |
    'NEWS' |
    'DISCOVERABLE' |
    'FEATURABLE' |
    'ANIMATED_ICON' |
    'BANNER' |
    'PUBLIC_DISABLED'
  )[]
  mfa_level: MFALevel
  application_id: Snowflake | null
  system_channel_id: Snowflake | null
  joined_at?: Timestamp
  large?: boolean
  unavailable?: boolean
  member_count?: number
  voice_states?: {
    channel_id: Snowflake | null
    user_id: Snowflake
    session_id: string
    deaf: boolean
    mute: boolean
    self_deaf: boolean
    self_mute: boolean
  }[]
  members?: {
    user: UserData
    nick?: string
    joined_at: Timestamp
    deaf: boolean
    mute: boolean
  }[]
  channels?: ChannelData[]
  presences?: {}[]
}
