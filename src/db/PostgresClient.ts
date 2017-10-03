import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { TYPES } from '../types';
import { PostgreSQLPool } from './PostgreSQLPool';

@injectable()
export class PostgresClient {
    dbClient:Client;
    clientConnectionPromise: Promise<void>;

    constructor(@inject(TYPES.PostgreSQLPool) postgreSQLPool:PostgreSQLPool) {
        this.clientConnectionPromise = postgreSQLPool.pool.connect().then(client => {
            this.dbClient = client;
        });
    }
}