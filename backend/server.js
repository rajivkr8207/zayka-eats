// Set Node.js process timezone to Indian Standard Time (IST) globally
process.env.TZ = 'Asia/Kolkata';

import http from 'http';
import { app } from './src/app.js';
import Config from './src/config/config.js';
import { ConnectDB } from './src/config/database.js';
import logger from './src/config/logger.js';
import { initializeSocket } from './src/config/socket.js';

await ConnectDB();

const server = http.createServer(app);
initializeSocket(server);

server.listen(Config.port, () => {
  logger.info(`Server is running on port ${Config.port} in IST (${new Date().toLocaleString()})`);
});
