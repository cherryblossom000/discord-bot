import type {ChannelData, MessageData} from './data'
import type {Channel} from './Channel'
import type {Message} from './Message'

interface Action<T, Data extends Record<string, any>> {
  handle(data: Data): T
}

export default interface ActionsManager {
  ChannelCreate: Action<{channel: Channel}, ChannelData>
  MessageCreate: Action<{message: Message}, MessageData>
}
