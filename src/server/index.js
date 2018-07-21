import { config } from './config';
import server from './server';

server.listen(config.port);

console.log(`Server running on port ${config.port}`);
