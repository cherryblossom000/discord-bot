import type {EventListener} from '../Client'

const listener: EventListener<'guildCreate'> = client => (): void =>
	client.setActivity()
export default listener
