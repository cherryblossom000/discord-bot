import type {EventListener} from '../Client'
import {handleError} from '../utils'

const listener: EventListener<'guildCreate'> =
  client => async (): Promise<void> =>
    client
      .setActivity()
      .catch(error =>
        handleError(client, error, 'Error setting activity on guild create:')
      )
export default listener
