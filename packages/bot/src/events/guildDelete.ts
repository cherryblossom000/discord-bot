import {handleError} from '../utils.js'
import type {EventListener} from '../Client'

const listener: EventListener<'guildDelete'> =
  client => async (): Promise<void> =>
    client
      .setActivity()
      .catch(error =>
        handleError(client, error, 'Error setting activity on guild delete:')
      )
export default listener
