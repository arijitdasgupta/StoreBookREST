import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { TYPES } from '../types';
import { PostgreSQL } from './PostgreSQL';

@injectable()
export class PostgresClient {
    dbClient:Client;
    clientConnectionPromise: Promise<void>;

    constructor(@inject(TYPES.PostgreSQL) postgreSQL:PostgreSQL) {
        this.clientConnectionPromise = postgreSQL.pool.connect().then(client => {
            this.dbClient = client;
        });
    }
}