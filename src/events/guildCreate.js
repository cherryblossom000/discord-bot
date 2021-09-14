import { handleError } from '../utils.js';
const listener = client => async () => client
    .setActivity()
    .catch(error => handleError(client, error, 'Error setting activity on guild create:'));
export default listener;
//# sourceMappingURL=guildCreate.js.map