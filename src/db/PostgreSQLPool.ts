import { Pool } from 'pg';
import { injectable } from 'inversify';

import { TYPES } from '../types';

export class PostgreSQLPool {
    pool: Pool;

    constructor(databaseUrl: string) {
        console.log('Initiating PostgreSQL connection pool');
        this.pool = new Pool({
            connectionString: databaseUrl
        });
    }
}