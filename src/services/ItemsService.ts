import { injectable, inject } from 'inversify';
import * as _ from 'lodash';

import { TYPES } from '../types';
import { ItemsRepository } from '../repositories/ItemsRepository';
import { TransactionsRepository } from '../repositories/TransactionsRepository';
import { TransactionTypes } from '../enums/TransactionTypes';
import { ITransactionObject } from '../services/TransactionsService';

export interface IItemObject {
    id: number;
    quantity: number;
    itemUnitOfQuantity: string;
    description: string;
    name: string;
    productCode: string;
    alertThreshold: string;
    created: string;
    deleted: string;
}

@injectable()
export class ItemsService {
    private itemsRepository: ItemsRepository;
    private transactionsRepository: TransactionsRepository;

    constructor(@inject(TYPES.ItemsRepository) itemsRepository:ItemsRepository,
        @inject(TYPES.TransactionsRepository) transactionsRepository:TransactionsRepository) {
        this.itemsRepository = itemsRepository;
        this.transactionsRepository = transactionsRepository;
    }

    private itemsMapper(item:any):IItemObject {
        return {
            id: item.id,
            quantity: item.item_quantity,
            description: item.item_description,
            itemUnitOfQuantity: item.item_quantity_unit,
            name: item.item_name,
            productCode: item.item_product_code,
            created: item.created,
            alertThreshold: item.item_alert_threshold,
            deleted: item.deleted
        };
    }

    getDeletedItems = ():Promise<IItemObject[]> => {
        return this.itemsRepository.getDeletedItems().then(rows => {
            return rows.map(this.itemsMapper);
        });
    }

    getAllItems = ():Promise<IItemObject[]> => {
        return this.itemsRepository.getAllItems().then((rows) => {
            return rows.map(this.itemsMapper);
        });
    }

    getItem = (itemId:number):Promise<IItemObject> => {
        return this.itemsRepository.getItem(itemId).then((rows) => {
            return rows.map(this.itemsMapper)[0];
        });
    }

    updateItem = (itemId:number, itemObject:IItemObject):Promise<IItemObject> => {
        // If there is Quantity, Updates the items and adds a new RESET transaction
        if (itemObject.quantity && !_.isNaN(parseFloat(itemObject.quantity.toString()))) {
            const newTransactionObject:ITransactionObject = {
                itemId: itemId,
                changeType: TransactionTypes.RESET,
                quantity: itemObject.quantity,
                description: null
            };

            // Three queries, if the system in use during a reboot, this will cause problems, no locking mechanism
            return this.transactionsRepository.postTransaction(newTransactionObject)
                .then(_ => this.itemsRepository.updateItem(itemId, itemObject))
                .then(_ => this.itemsRepository.updateItemQuantity(itemId, itemObject.quantity))
                .then(items => items.map(this.itemsMapper)[0]);
        } else {
            return this.itemsRepository.updateItem(itemId, itemObject).then(items => items.map(this.itemsMapper)[0]);
        }
    }

    createItem = (itemObject: IItemObject) => {
        return this.itemsRepository.createItem(itemObject).then((rows) => {
            return rows.map(this.itemsMapper)[0];
        });
    }

    deleteItem = (itemId: number) => {
        return this.itemsRepository.deleteItem(itemId).then((rows) => {
            return rows.map(this.itemsMapper)[0];
        })
    }
}