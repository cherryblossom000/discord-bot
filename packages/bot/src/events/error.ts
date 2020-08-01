import {sendMeError} from '../utils'
import type {EventListener} from '../Client'

const listener: EventListener<'error'> = client => async (
  error
): Promise<void> => sendMeError(client, error, 'The `error` event fired.')
export default listener
