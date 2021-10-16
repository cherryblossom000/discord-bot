import { handleError } from '../utils.js';
const listener = client => (error) => handleError(client, error, 'The `error` event fired:');
export default listener;
//# sourceMappingURL=error.js.map