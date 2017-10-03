import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { PostgresClient } from '../db/PostgresClient';
import { UpdateQueryUtils, IUpdateSpec } from '../utils/UpdateQueryUtils';
import { IOHalter } from '../utils/IOHalter';
import { TYPES } from '../types';
import { IItemObject } from '../services/ItemsService';

@injectable()
export class ItemsRepository {
    private updateQueryUtils: UpdateQueryUtils;
    private dbClient: Client;

    private returningColumns = '*';

    constructor(@inject(TYPES.PostgresClient) postgresClient:PostgresClient, 
        @inject(TYPES.UpdateQueryUtils) updateQueryUtils:UpdateQueryUtils,
        @inject(TYPES.IOHalter) ioHalter:IOHalter) {

        this.updateQueryUtils = updateQueryUtils;
        
        ioHalter.addPromise(postgresClient.clientConnectionPromise.then(client => {
            this.dbClient = client;
        }));
    }

    private itemUpdateSpecs:IUpdateSpec[] = [
        {
            dbColumnName: 'item_quantity_unit',
            objectKey: 'itemUnitOfQuantity',
            mapper: (item) => item
        },
        {
            dbColumnName: 'item_description',
            objectKey: 'description',
            mapper: (item) => item
        },
        {
            dbColumnName: 'item_name',
            objectKey: 'name',
            mapper: (item) => item
        },
        {
            dbColumnName: 'item_product_code',
            objectKey: 'productCode',
            mapper: (item) => item
        },
        {
            dbColumnName: 'item_alert_threshold',
            objectKey: 'alertThreshold',
            mapper: (item) => item
        }
    ];

    private itemQuantityUpdateSpecs:IUpdateSpec[] = [
        {
            dbColumnName: 'item_quantity',
            objectKey: 'quantity',
            mapper: (item) => item
        }
    ];

    private generateUpdateQuery = (id: number, itemObject:any, updateSpecs:IUpdateSpec[]):{queryString: string, queryParamArray: any[]} => {
        const setStringAndArray = this.updateQueryUtils.generateSetStringAndArray(itemObject, updateSpecs);

        return {
            queryString: `UPDATE ITEMS SET ${setStringAndArray.setString} WHERE id=${id} RETURNING ${this.returningColumns}`,
            queryParamArray: setStringAndArray.setArray
        };
    };

    getAllItems = ():Promise<any[]> => {
        return this.dbClient.query('SELECT * FROM ITEMS WHERE deleted=FALSE').then(data => data.rows);
    }

    getDeletedItems = ():Promise<any[]> => {
        return this.dbClient.query('SELECT * FROM ITEMS WHERE deleted=TRUE').then(data => data.rows);
    }

    getItem = (itemId: number):Promise<any[]> => {
        return this.dbClient.query('SELECT * FROM ITEMS WHERE id=$1', [itemId]).then(data => data.rows);
    }

    updateItem = (itemId: number, itemObject:IItemObject):Promise<any> => {
        const { queryString, queryParamArray } = this.generateUpdateQuery(itemId, itemObject, this.itemUpdateSpecs);

        return this.dbClient.query(queryString, queryParamArray).then((data) => {
            return data.rows;
        });
    }

    updateItemQuantity = (itemId: number, quantity: number) => {
        const { queryString, queryParamArray } = this.generateUpdateQuery(itemId, {quantity}, this.itemQuantityUpdateSpecs);
        
        return this.dbClient.query(queryString, queryParamArray).then((data) => {
            return data.rows;
        });
    }

    createItem = (itemObject:IItemObject):Promise<any[]> => {
        return this.dbClient.query(`INSERT INTO ITEMS (item_name, 
            item_description, item_quantity, item_quantity_unit, 
            item_alert_threshold, item_product_code) 
            VALUES($1, $2, $3, $4, $5, $6) RETURNING ${this.returningColumns}`, [
            itemObject.name,
            itemObject.description,
            itemObject.quantity,
            itemObject.itemUnitOfQuantity,
            itemObject.alertThreshold,
            itemObject.productCode
        ]).then(data => data.rows);
    }

    deleteItem = (itemId):Promise<any> => {
        return this.dbClient.query(`UPDATE ITEMS SET deleted=TRUE WHERE id=$1 RETURNING ${this.returningColumns}`, [itemId]).then((data) => {
            return data.rows;
        });
    }
}