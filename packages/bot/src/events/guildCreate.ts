import {handleError} from '../utils.js'
import type {EventListener} from '../Client'

const listener: EventListener<'guildCreate'> =
  client => async (): Promise<void> =>
    client
      .setActivity()
      .catch(error =>
        handleError(client, error, 'Error setting activity on guild create:')
      )
export default listener
