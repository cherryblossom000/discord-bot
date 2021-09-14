import {handleError} from '../utils.js'
import type {EventListener} from '../Client'

const listener: EventListener<'shardResume'> =
  client => async (): Promise<void> =>
    client
      .setActivity()
      .catch(error =>
        handleError(client, error, 'Error setting activity on shard resume:')
      )
export default listener
