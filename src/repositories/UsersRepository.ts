import { injectable, inject } from 'inversify';
import { SHA256Utils } from '../utils/SHA256Utils';
import { PostgreSQL } from '../Db/PostgreSQL';
import { UpdateQueryUtils, IUpdateSpec } from '../utils/UpdateQueryUtils';
import { TYPES } from '../types';

@injectable()
export class UsersRepository {
    sha256Utils:SHA256Utils;
    postgreSQL:PostgreSQL;
    updateQueryUtils: UpdateQueryUtils;

    constructor(@inject(TYPES.PostgreSQL) postgreSQL:PostgreSQL, 
        @inject(TYPES.SHA256Utils) sha256Utils:SHA256Utils,
        @inject(TYPES.UpdateQueryUtils) updateQueryUtils:UpdateQueryUtils) {
        this.sha256Utils = sha256Utils;
        this.postgreSQL = postgreSQL;
        this.updateQueryUtils = updateQueryUtils;
    }

    private returningColumns = '*';

    // CREATE TABLE USERS (
    //     id serial not null,
    //     username varchar(256) unique,
    //     passwd varchar(64),
    //     created timestamp default current_timestamp,
    //     active BOOLEAN
    //   );

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
        return this.postgreSQL.pool.connect().then((client) => {
            return client.query('SELECT * FROM USERS');
        }).then((data) => {
            return data.rows;
        });
    };

    createUser = (userObject:any):Promise<any[]> => {
        return this.postgreSQL.pool.connect().then((client) => {
            return client.query(`INSERT INTO USERS (username, passwd, active, role) VALUES($1, $2, $3, $4) RETURNING ${this.returningColumns}`, [
                userObject.username, 
                this.sha256Utils.makeHashFromPassword(userObject.password), 
                true,
                userObject.role]);
        }).then((data) => {
            return data.rows;
        });
    }

    updateUser = (userId:number, userObject: any):Promise<any[]> => {
        return this.postgreSQL.pool.connect().then((client) => {
            const { queryString, queryParamArray } = this.generateUpdateQuery(userId, userObject, this.userUpdateObjectSpecs)
            return client.query(queryString, queryParamArray);
        }).then((data) => {
            return data.rows;
        });
    }

    deleteUser = (userId:number):Promise<any> => {
        return this.postgreSQL.pool.connect().then((client) => {
            return client.query('DELETE FROM USERS WHERE id=$1', [userId]);
        });
    }

    getUser = (userId:number):Promise<any[]> => {
        return this.postgreSQL.pool.connect().then((client) => {
            return client.query('SELECT id, username, active, created, role FROM USERS WHERE id = $1', [userId])
        }).then((data) => {
            return data.rows;
        });
    }
}