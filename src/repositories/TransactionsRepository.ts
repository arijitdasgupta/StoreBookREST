import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { PostgreSQL } from '../db/PostgreSQL';
import { ITransactionObject } from '../services/TransactionsService';
import { TYPES } from '../types';

@injectable()
export class TransactionsRepository {
    postgreSQL: PostgreSQL;
    private dbClient:Client;

    private returningColumns = '*';

    constructor(@inject(TYPES.PostgreSQL) postgreSQL:PostgreSQL) {
        this.postgreSQL = postgreSQL;

        this.postgreSQL.pool.connect().then(client => {
            this.dbClient = client;
        });
    }

    // CREATE TABLE TRANSACTIONS (
    //     id serial PRIMARY KEY not null,
    //     item_id integer REFERENCES ITEMS(id) not null,
    //     transaction_type varchar(20) not null,
    //     transaction_amount real not null,
    //     transaction_description varchar(500)
    //   );

    getAllTransactions = ():Promise<any> => {
        return this.dbClient.query('SELECT * FROM TRANSACTIONS').then(data => data.rows);
    }

    getTranscation = (transactionId: number):Promise<any> => {
        return this.dbClient.query('SELECT * FROM TRANSACTIONS WHERE id=$1',[transactionId]).then(data => data.rows);
    }

    postTransaction = (transactionObject:ITransactionObject):Promise<any> => {
        return this.dbClient.query(`INSERT INTO TRANSACTIONS (item_id, transaction_type, transaction_amount, transaction_description) VALUES ($1, $2, $3, $4) RETURNING ${this.returningColumns}`, [
            transactionObject.itemId,
            transactionObject.changeType,
            transactionObject.quantity,
            transactionObject.description
        ]).then(data => data.rows);
    }
}