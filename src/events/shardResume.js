import { handleError } from '../utils.js';
const listener = client => async () => client
    .setActivity()
    .catch(error => handleError(client, error, 'Error setting activity on shard resume:'));
export default listener;
//# sourceMappingURL=shardResume.js.map