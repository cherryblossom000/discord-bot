import type {EventListener} from '../Client'

const listener: EventListener<'guildCreate'> = client => async (): Promise<
  void
> => client.setActivity()
export default listener
