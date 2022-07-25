import type {EventListener} from '../Client'

const listener: EventListener<'shardResume'> = client => (): void =>
	client.setActivity()
export default listener
