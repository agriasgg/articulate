import AsyncRedis from 'async-redis';
import Package from '../../../package.json';
import InitializeModels from './lib/initialize-models';

const name = 'redis';
const logger = require('../../../util/logger')({ name: `plugin:${name}` });

module.exports = {
    name,
    pkg: Package,
    async register(server, options) {

        const { host, port, retry, retryTimeout } = options;

        const retryStrategy = (settings) => {

            logger.info(`redis::retryStrategy::${JSON.stringify(settings)}`);
            if (settings.error && settings.error.code === 'ECONNREFUSED') {
                logger.info(`Connection failed. Attempt ${settings.attempt} of ${retry}`);
                if (settings.attempt === retry) {
                    logger.error('Failure during Redis connection ');
                    logger.error(settings.error);
                    return process.exit(1);
                }

                return retryTimeout;

            }
            return retryTimeout;
        };
        await new Promise((resolve, reject) => {

            const client = AsyncRedis.createClient(port, host, { retry_strategy: retryStrategy });
            // Wait for connection
            client.once('ready', async () => {

                logger.info('ready');
                const nohm = await InitializeModels({ redis: client, path: `${__dirname}/models` });
                server.app[name] = nohm;
                resolve();
            });

            // Listen to errors
            client.on('error', (err) => {

                logger.error(err);
                reject(err);
            });
        });
        logger.info('registered');
    }
};
