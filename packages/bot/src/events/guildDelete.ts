import type {EventListener} from '../Client'

const listener: EventListener<'guildDelete'> = client => (): void =>
	client.setActivity()
export default listener
