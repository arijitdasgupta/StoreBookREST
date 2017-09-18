import { injectable, inject } from 'inversify';

import { TYPES } from '../types';
import { ItemsRepository } from '../repositories/ItemsRepository';

// CREATE TABLE ITEMS (
    //     id serial PRIMARY KEY not null,
    //     item_name varchar(256),
    //     item_description varchar(500),
    //     item_quantity real not null,
    //     item_quantity_unit varchar(50) not null,
    //     item_alert_threshold real,
    //     item_product_code varchar(100),
    //     created timestamp default current_timestamp
    //   );

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

    constructor(@inject(TYPES.ItemsRepository) itemsRepository:ItemsRepository) {
        this.itemsRepository = itemsRepository;
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

    getDeletedItems = () => {
        return this.itemsRepository.getDeletedItems().then(rows => {
            return rows.map(this.itemsMapper);
        });
    }

    getAllItems = () => {
        return this.itemsRepository.getAllItems().then((rows) => {
            return rows.map(this.itemsMapper);
        });
    }

    getItem = (itemId) => {
        return this.itemsRepository.getItem(itemId).then((rows) => {
            return rows.map(this.itemsMapper)[0];
        });
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