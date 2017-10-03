import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { PostgresClient } from '../db/PostgresClient';
import { ITransactionObject } from '../services/TransactionsService';
import { TYPES } from '../types';

@injectable()
export class TransactionsRepository {
    private dbClient:Client;

    private returningColumns = '*';
    private joiningColumns = ''

    constructor(@inject(TYPES.PostgresClientForRepositories) postgresClient:PostgresClient) {
        this.dbClient = postgresClient.dbClient;
    }

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