import {handleError} from '../utils.js'
import type {EventListener} from '../Client'

const listener: EventListener<'error'> =
	client =>
	(error): void =>
		handleError(client, error, 'The `error` event fired:')
export default listener
