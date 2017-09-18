import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { PostgreSQL } from '../db/PostgreSQL';
import { UpdateQueryUtils } from '../utils/UpdateQueryUtils';
import { TYPES } from '../types';
import { IItemObject } from '../services/ItemsService';

@injectable()
export class ItemsRepository {
    private postgreSQL:PostgreSQL;
    private updateQueryUtils: UpdateQueryUtils;
    private dbClient: Client;

    private returningColumns = '*';

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

    constructor(@inject(TYPES.PostgreSQL) postgreSQL:PostgreSQL, 
        @inject(TYPES.UpdateQueryUtils) updateQueryUtils:UpdateQueryUtils) {
        this.postgreSQL = postgreSQL;
        this.updateQueryUtils = updateQueryUtils;

        this.postgreSQL.pool.connect().then((client) => {
            this.dbClient = client;
        });
    }

    getAllItems = ():Promise<any[]> => {
        return this.dbClient.query('SELECT * FROM ITEMS WHERE deleted=FALSE').then(data => data.rows);
    }

    getDeletedItems = ():Promise<any[]> => {
        return this.dbClient.query('SELECT * FROM ITEMS WHERE deleted=TRUE').then(data => data.rows);
    }

    getItem = (itemId: number):Promise<any[]> => {
        return this.dbClient.query('SELECT * FROM ITEMS WHERE id=$1', [itemId]).then(data => data.rows);
    }

    createItem = (itemObject:IItemObject):Promise<any[]> => {
        return this.dbClient.query(`INSERT INTO ITEMS (item_name, item_description, item_quantity, item_quantity_unit, item_alert_threshold, item_product_code) VALUES($1, $2, $3, $4, $5, $6) RETURNING ${this.returningColumns}`, [
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