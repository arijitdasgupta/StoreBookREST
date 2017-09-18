import { injectable, inject } from 'inversify';
import * as _ from 'lodash';

import { PostgreSQL } from '../Db/PostgreSQL';
import { TYPES } from '../types';
import { SHA256Utils } from '../utils/SHA256Utils';

interface IUserObject {
    id: number;
    username: string;
    active: boolean;
    created: string;
}

interface IUserObjectCreate {
    username: string;
    password: string;
}

interface IUserUpdateSpec {
    mapper: <T>(T) => T;
    objectKey: string;
    dbColumnName: string;
}

@injectable()
export class UsersService {
    postgreSQL: PostgreSQL;
    sha256Utils: SHA256Utils;

    constructor(@inject(TYPES.PostgreSQL) postgreSQL:PostgreSQL, @inject(TYPES.SHA256Utils) sha256Utils:SHA256Utils) {
        this.sha256Utils = sha256Utils;
        this.postgreSQL = postgreSQL;
    }

    // CREATE TABLE USERS (
    //     id serial not null,
    //     username varchar(256) unique,
    //     passwd varchar(64),
    //     created timestamp default current_timestamp,
    //     active BOOLEAN
    //   );

    private userMapper = (user:any):IUserObject => {
        return {
            id: user.id,
            username: user.username,
            active: user.active,
            created: user.created
        } as IUserObject;
    }

    private updateUserQueryGenerator = (userId: number, userObject:any):{queryString: string, queryParamArray: any[]} => {
        // UPDATE USERS SET (passwd='Muuah') WHERE id=1 RETURNING id, username, active, created;
        const objectSpecs:IUserUpdateSpec[] = [
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
            }
        ];

        const setStringAndArray = _.keys(userObject).filter(userObjectKey => {
            return objectSpecs.map(i => i.objectKey).filter(key => key === userObjectKey)[0];
        })
        .map(key => {
            return _.assign({}, _.filter(objectSpecs, spec => spec.objectKey === key)[0], {value: userObject[key]});
        })
        .reduce((acc, keyMapperAndValue:IUserUpdateSpec & {value:any}, index) => {
            return {
                setString: `${acc.setString}${index?',':''}${keyMapperAndValue.dbColumnName}=$${index+1}`,
                queryParamArray: acc.queryParamArray.concat([keyMapperAndValue.mapper(keyMapperAndValue.value)])
            }
        }, {setString: '', queryParamArray: []});


        return {
            queryString: `UPDATE USERS SET ${setStringAndArray.setString} WHERE id=${userId} RETURNING id, username, active, created`,
            queryParamArray: setStringAndArray.queryParamArray
        };
    };

    getAllUsers = ():Promise<IUserObject[]> => {
        return this.postgreSQL.pool.connect().then((client) => {
            return client.query('SELECT * FROM USERS');
        }).then((data) => {
            return data.rows.map(this.userMapper);
        });
    }

    createUser = (userObject:IUserObjectCreate):Promise<IUserObject> => {
        return this.postgreSQL.pool.connect().then((client) => {
            return client.query('INSERT INTO USERS (username, passwd, active) VALUES($1, $2, $3) RETURNING id, username, active, created', [
                userObject.username, 
                this.sha256Utils.makeHashFromPassword(userObject.password), 
                true])
        }).then((data) => {
            const userObject = data.rows.map(this.userMapper)[0];
            return userObject;
        });;
    }

    getUser = (userId:number):Promise<IUserObject> => {
        return this.postgreSQL.pool.connect().then((client) => {
            return client.query('SELECT id, username, active, created FROM USERS WHERE id = $1', [userId])
        }).then((data) => {
            return data.rows.map(this.userMapper)[0];
        });
    }

    updateUser = (userId:number, userObject: any):Promise<IUserObject> => {
        return this.postgreSQL.pool.connect().then((client) => {
            const { queryString, queryParamArray } = this.updateUserQueryGenerator(userId, userObject)
            return client.query(queryString, queryParamArray);
        }).then((data) => {
            return data.rows.map(this.userMapper)[0];
        });
    }
}