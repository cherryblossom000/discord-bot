import type {Snowflake, Timestamp} from './util'
import type {EmojiData} from './emoji'
import type {UserData} from './user'

export const enum MessageType {
  DEFAULT,
  RECIPIENT_ADD,
  RECIPIENT_REMOVE,
  CALL,
  CHANNEL_NAME_CHANGE,
  CHANNEL_ICON_CHANGE,
  CHANNEL_PINNED_MESSAGE,
  GUILD_MEMBER_JOIN,
  USER_PREMIUM_GUILD_SUBSCRIPTION,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2,
  USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3,
  CHANNEL_FOLLOW_ADD
}

interface AttachmentData {
  id: Snowflake
  filename: string
  size: number
  url: string
  proxy_url: string
  height: number | null
  width: number | null
}

interface EmbedImageData {
  url?: string
  proxy_url?: string
  height?: number
  width?: number
}

interface EmbedPerson {
  name?: string
  url?: string
}

interface EmbedData {
  title?: string
  type?: string
  description?: string
  url?: string
  timestamp?: Timestamp
  color?: number
  footer?: {
    text: string
    icon_url?: string
    proxy_icon_url?: string
  }
  image?: EmbedImageData
  thumbnail?: EmbedImageData
  video?: Omit<EmbedImageData, 'proxy_url'>
  provider?: EmbedPerson
  author?: EmbedPerson & {icon_url?: string}
  fields?: {
    name: string
    value: string
    inline?: boolean
  }[]
}

export interface MessageData {
  id: Snowflake
  channel_id: Snowflake
  author: UserData
  content: string
  timestamp: Timestamp
  edited_timestamp: Timestamp | null
  tts: boolean
  mention_everyone: boolean
  mentions: UserData[]
  mention_roles: Snowflake[]
  attachments: AttachmentData[]
  embeds: EmbedData[]
  reactions?: {
    count: number
    me: boolean
    emoji: Pick<EmojiData, 'id' | 'name'>
  }
  nonce: string
  pinned: boolean
  webhook_id?: string
  type: MessageType
}
