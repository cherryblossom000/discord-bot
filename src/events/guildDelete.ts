import type {ClientListener} from '../Client'

const listener: ClientListener<'guildDelete'> = client => async (): Promise<
  void
> => client.setActivity()
export default listener
