import {handleError} from '../utils'
import type {EventListener} from '../Client'

const listener: EventListener<'shardResume'> = client => async (): Promise<
  void
> =>
  client
    .setActivity()
    .catch(async error =>
      handleError(client, error, 'Error setting activity on shard resume')
    )
export default listener
