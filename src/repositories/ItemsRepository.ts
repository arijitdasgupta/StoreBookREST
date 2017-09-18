import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { PostgreSQL } from '../db/PostgreSQL';
import { UpdateQueryUtils } from '../utils/UpdateQueryUtils';
import { TYPES } from '../types';

@injectable()
export class ItemsRepository {
    private postgreSQL:PostgreSQL;
    private updateQueryUtils: UpdateQueryUtils;
    private dbClient: Client;

    // CREATE TABLE ITEMS (
    //     id serial PRIMARY KEY not null,
    //     item_name varchar(256),
    //     item_description varchar(500),
    //     item_quantity real not null,
    //     item_quantity_unit varchar(50) not null,
    //     item_alert_threshold real,
    //     item_product_code varchar(100),
    //     created_by varchar(256) references USERS(id) not null,
    //     created timestamp default current_timestamp
    //   );

    constructor(@inject(TYPES.PostgreSQL) postgreSQL:PostgreSQL, 
        @inject(TYPES.UpdateQueryUtils) updateQueryUtils:UpdateQueryUtils) {
        this.postgreSQL = postgreSQL;
        this.updateQueryUtils = updateQueryUtils;

        this.postgreSQL.pool.connect().then((client) => {
            this.dbClient = client;
        });
    }

    getAllItems = () => {
        this.postgreSQL.pool.connect()
    }
}