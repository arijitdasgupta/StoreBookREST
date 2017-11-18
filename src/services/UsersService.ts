import { injectable, inject } from 'inversify';
import * as _ from 'lodash';

import { TYPES } from '../types';
import { SHA256Utils } from '../utils/SHA256Utils';
import { UpdateQueryUtils, IUpdateSpec } from '../utils/UpdateQueryUtils';
import { UsersRepository } from '../repositories/UsersRepository';

interface IUserObject {
    id: number;
    username: string;
    active: boolean;
    created: string;
    role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
}

export interface IUserObjectCreate {
    username: string;
    password: string;
    role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
    email: string;
}

@injectable()
export class UsersService {
    // Object validations should also go in this class...

    usersRepository: UsersRepository;

    constructor(
        @inject(TYPES.UsersRepository) usersRepository:UsersRepository) {
        this.usersRepository = usersRepository;
    }

    // Maps table columned data to data
    private userMapper = (user:any):IUserObject => {
        return {
            id: user.id,
            username: user.username,
            active: user.active,
            created: user.created,
            role: user.role,
            email: user.email
        } as IUserObject;
    }

    getAllUsers = ():Promise<IUserObject[]> => {
        return this.usersRepository.getAllUsers().then(rows => {
            return rows.map(this.userMapper);
        });
    }

    createUser = (userObject:IUserObjectCreate):Promise<IUserObject> => {
        return this.usersRepository.createUser(userObject).then(users => {
            return users.map(this.userMapper)[0];
        });
    }

    getUser = (userId:number):Promise<IUserObject> => {
        return this.usersRepository.getUser(userId).then((users) => {
            return users.map(this.userMapper)[0];
        });
    }

    updateUser = (userId:number, userObject: any):Promise<IUserObject> => {
        return this.usersRepository.updateUser(userId, userObject).then((users) => {
            return users.map(this.userMapper)[0];
        });
    }

    deleteUser = (userId:number):Promise<boolean> => {
        return this.usersRepository.deleteUser(userId).then(_ => true);
    }
}