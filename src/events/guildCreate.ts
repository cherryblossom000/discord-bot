import type {ClientListener} from '../Client'

const listener: ClientListener<'guildCreate'> = client => async (): Promise<void> => client.setActivity()
export default listener
