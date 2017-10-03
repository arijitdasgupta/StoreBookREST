import { injectable, inject } from 'inversify';
import { Client } from 'pg';

import { SHA256Utils } from '../utils/SHA256Utils';
import { PostgresClient } from '../db/PostgresClient';
import { UpdateQueryUtils, IUpdateSpec } from '../utils/UpdateQueryUtils';
import { IUserObjectCreate } from '../services/UsersService';
import { TYPES } from '../types';

@injectable()
export class UsersRepository {
    private sha256Utils:SHA256Utils;
    private updateQueryUtils: UpdateQueryUtils;
    private dbClient: Client;

    constructor(@inject(TYPES.PostgresClientForRepositories) postgresClient:PostgresClient, 
        @inject(TYPES.SHA256Utils) sha256Utils:SHA256Utils,
        @inject(TYPES.UpdateQueryUtils) updateQueryUtils:UpdateQueryUtils) {
        this.sha256Utils = sha256Utils;
        this.updateQueryUtils = updateQueryUtils;
        this.dbClient = postgresClient.dbClient;
    }

    private returningColumns = '*';

    private userUpdateObjectSpecs:IUpdateSpec[] = [
        {
            dbColumnName: 'username',
            objectKey: 'username',
            mapper: (item) => item
        },
        {
            dbColumnName: 'passwd',
            objectKey: 'password',
            mapper: (item) => this.sha256Utils.makeHashFromPassword(item)
        },
        {
            dbColumnName: 'active',
            objectKey: 'active',
            mapper: (item) => item
        },
        {
            dbColumnName: 'role',
            objectKey: 'role',
            mapper: (item) => item
        }
    ];

    private generateUpdateQuery = (id: number, userObject:any, updateSpecs:IUpdateSpec[]):{queryString: string, queryParamArray: any[]} => {
        const setStringAndArray = this.updateQueryUtils.generateSetStringAndArray(userObject, updateSpecs);

        return {
            queryString: `UPDATE USERS SET ${setStringAndArray.setString} WHERE id=${id} RETURNING ${this.returningColumns}`,
            queryParamArray: setStringAndArray.setArray
        };
    };

    getAllUsers = ():Promise<any[]> => {
        return this.dbClient.query('SELECT * FROM USERS').then((data) => {
            return data.rows;
        });
    };

    createUser = (userObject:IUserObjectCreate):Promise<any[]> => {
        return this.dbClient.query(`INSERT INTO USERS (username, passwd, active, role) VALUES($1, $2, $3, $4) RETURNING ${this.returningColumns}`, [
            userObject.username, 
            this.sha256Utils.makeHashFromPassword(userObject.password), 
            true,
            userObject.role]).then((data) => {
                return data.rows;
            });
    };

    updateUser = (userId:number, userObject: any):Promise<any[]> => {
        const { queryString, queryParamArray } = this.generateUpdateQuery(userId, userObject, this.userUpdateObjectSpecs)
        return this.dbClient.query(queryString, queryParamArray).then((data) => {
            return data.rows;
        });
    }

    deleteUser = (userId:number):Promise<any> => {
        return this.dbClient.query('UPDATE USERS SET active=FALSE WHERE id=$1', [userId]);
    }

    getUser = (userId:number):Promise<any[]> => {
        return this.dbClient.query('SELECT id, username, active, created, role FROM USERS WHERE id = $1', [userId]).then((data) => {
            return data.rows;
        });
    }
}