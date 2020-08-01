import type {EventListener} from '../Client'

const listener: EventListener<'guildDelete'> = client => async (): Promise<
  void
> => client.setActivity()
export default listener
