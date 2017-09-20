import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import { TransactionsRepository } from '../repositories/TransactionsRepository';
import { ItemsRepository } from '../repositories/ItemsRepository';
import { TransactionTypes } from '../enums/TransactionTypes';
import * as _ from 'lodash';

export interface ITransactionObject {
    id?: number;
    itemId: number;
    changeType: string;
    quantity: number;
    description: string;
    transactionTime: string;
}

export interface ITransactionObjectJoined extends ITransactionObject {
    id?: number;
    changeType: string;
    quantity: number;
    description: string;
    transactionTime: string;
    itemId: number;
    itemName: string;
    itemDescription: string;
}

@injectable()
export class TransactionsService {
    transactionRepository:TransactionsRepository;
    itemsRepository:ItemsRepository;

    constructor(@inject(TYPES.TransactionsRepository) transactionsRepository:TransactionsRepository,
        @inject(TYPES.ItemsRepository) itemsRepository:ItemsRepository) {
        this.transactionRepository = transactionsRepository;
        this.itemsRepository = itemsRepository;
    }

    // CREATE TABLE TRANSACTIONS (
    //     id serial PRIMARY KEY not null,
    //     item_id integer REFERENCES ITEMS(id) not null,
    //     transaction_type varchar(20) not null,
    //     transaction_amount real not null,
    //     transaction_description varchar(500)
    //   );

    private transactionsMapper = (transaction:any):ITransactionObject => {
        return {
            id: transaction.id,
            itemId: transaction.item_id,
            changeType: transaction.transaction_type,
            quantity: transaction.transaction_amount,
            description: transaction.transaction_description,
            transactionTime: transaction.transaction_time
        };
    }
    
    private transactionsMapperJoined = (transaction:any):ITransactionObjectJoined => {
        return {
            id: transaction.id,
            itemId: transaction.item_id,
            changeType: transaction.transaction_type,
            description: transaction.transaction_description,
            itemDescription: transaction.item_description,
            quantity: transaction.transaction_amount,
            itemName: transaction.item_name,
            transactionTime: transaction.transaction_time
        }
    }

    private updateItemQuantity = (transaction:ITransactionObject):Promise<any> => {
        return this.itemsRepository.getItem(transaction.itemId).then(items => {
            const item = items[0];
            let newQuantity = item.item_quantity;
            if (transaction.changeType === TransactionTypes.INCREMENT) {
                newQuantity += transaction.quantity;
            } else if (transaction.changeType === TransactionTypes.DECREMENT) {
                newQuantity -= transaction.quantity;
            }
            return this.itemsRepository.updateItemQuantity(transaction.itemId, newQuantity);
        });
    }

    getTransaction = (transactionId:number):Promise<ITransactionObject> => {
        return this.transactionRepository.getTranscation(transactionId).then(rows => rows.map(this.transactionsMapperJoined)[0]);
    }

    getAllTransactions = ():Promise<ITransactionObject[]> => {
        return this.transactionRepository.getAllTransactions().then(rows => rows.map(this.transactionsMapperJoined));
    }

    // Three queries, if the system in use during a reboot, this will cause problems, no locking mechanism
    createTransaction = (transactionObject:ITransactionObject):Promise<ITransactionObject> => {
        const transactionAmount = transactionObject.quantity;
        // TODO: Ugly, refactor
        if (transactionObject.quantity && !_.isNaN(parseFloat(transactionObject.quantity.toString()))) {
            return this.updateItemQuantity(transactionObject).then(_ => {
                return this.transactionRepository.postTransaction(transactionObject)
            }).then(transactions => {
                return transactions.map(this.transactionsMapper)[0];
            });
        } else {
            return Promise.reject(null);
        }
    }
}