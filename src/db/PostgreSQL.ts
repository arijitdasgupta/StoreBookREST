import { Pool } from 'pg';
import { injectable } from 'inversify';

@injectable()
export class PostgreSQL {
    pool: Pool;

    constructor() {
        // Heroku provides with DATABASE_URL... OR, the default postgreSQL docker image username and password is used
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://postgres:mysecretpassword@localhost:5432/storebook_db'
        });

        console.log('Initiated connection to PostgreSQL');
    }
}