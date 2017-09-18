import * as express from 'express';
import { TYPES } from '../types';
import { inject, injectable } from 'inversify';
import * as bodyParser from 'body-parser';

import * as interfaces from '../interfaces';
import { UsersService } from '../services/UsersService';

@injectable()
export class UsersController implements interfaces.IController {
    private usersService: UsersService;
    application: express.Application;

    constructor(@inject(TYPES.UsersService) usersService:UsersService) {
        this.usersService = usersService;

        this.application = express();
        
        this.application.use(bodyParser.json());

        this.application.get('/users', this.getAll);
        this.application.get('/users/:id', this.get);
        this.application.post('/users', this.post);
        this.application.put('/users/:id', this.update);
        this.application.delete('/users/:id', this.delete);
    }

    private getAll:express.RequestHandler = (request, response) => {
        this.usersService.getAllUsers().then((res) => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.status(500).send({
                statusCode: 500,
                data: e
            });
        });
    }

    private get:express.RequestHandler = (request, response) => {
        this.usersService.getUser(parseInt(request.params.id)).then((res) => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.status(500).send({
                statusCode: 500,
                data: e
            });
        });;
    }

    private post:express.RequestHandler = (request, response) => {
        this.usersService.createUser(request.body).then((res) => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.status(500).send({
                statusCode: 500,
                data: e
            });
        });
    }

    private update:express.RequestHandler = (request, response) => {
        this.usersService.updateUser(parseInt(request.params.id), request.body).then((res) => {
            response.status(500).send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.status(500).send({
                statusCode: 500,
                data: e
            });
        });
    }

    private delete:express.RequestHandler = (request, response) => {
        this.usersService.deleteUser(parseInt(request.params.id)).then((res) => {
            response.status(500).send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.status(500).send({
                statusCode: 500,
                data: e
            });
        });
    }
}