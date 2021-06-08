import type {EventListener} from '../Client'
import {handleError} from '../utils'

const listener: EventListener<'shardResume'> =
  client => async (): Promise<void> =>
    client
      .setActivity()
      .catch(error =>
        handleError(client, error, 'Error setting activity on shard resume:')
      )
export default listener
