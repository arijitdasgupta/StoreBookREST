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
    private joiningColumns = ''

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
    //     transaction_description varchar(500),
    //     transaction_time timestamp default current_timestamp,
    //   );

    // CREATE TABLE ITEMS (
    //     id serial PRIMARY KEY not null,
    //     item_name varchar(256) not null,
    //     item_description varchar(500),
    //     item_quantity real not null,
    //     item_quantity_unit varchar(50) not null,
    //     item_alert_threshold real,
    //     item_product_code varchar(100),
    //     created timestamp default current_timestamp,
    //     deleted BOOLEAN default FALSE
    //   );

    // Refactor SQL query

    getAllTransactions = ():Promise<any> => {
        return this.dbClient.query(`SELECT 
            TRANSACTIONS.id as id, TRANSACTIONS.item_id as item_id, TRANSACTIONS.transaction_type as transaction_type, TRANSACTIONS.transaction_amount as transaction_amount, 
            TRANSACTIONS.transaction_description as transaction_description, TRANSACTIONS.transaction_time as transaction_time,
            ITEMS.item_name as item_name, ITEMS.item_description as item_description
            FROM TRANSACTIONS 
            INNER JOIN ITEMS ON (ITEMS.id = TRANSACTIONS.item_id)`).then(data => data.rows);
    }

    getTranscation = (transactionId: number):Promise<any> => {
        return this.dbClient.query(`SELECT 
            TRANSACTIONS.id as id, TRANSACTIONS.item_id as item_id, TRANSACTIONS.transaction_type as transaction_type, TRANSACTIONS.transaction_amount as transaction_amount, 
            TRANSACTIONS.transaction_description as transaction_description, TRANSACTIONS.transaction_time as transaction_time,
            ITEMS.item_name as item_name, ITEMS.item_description as item_description
            FROM TRANSACTIONS 
            INNER JOIN ITEMS ON (ITEMS.id = TRANSACTIONS.item_id AND TRANSACTIONS.id=$1)`,[transactionId]).then(data => data.rows);
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