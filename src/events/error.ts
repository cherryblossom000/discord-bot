import {sendMeError} from '../utils'
import type {ClientListener} from '../Client'

const listener: ClientListener<'error'> = client => async (
  error
): Promise<void> => sendMeError(client, error, 'The `error` event fired.')
export default listener
