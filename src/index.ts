import app from './app';
import { logger } from './utils/logger';
import { config } from './config/config';

const port = config.port || 3000;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
});
