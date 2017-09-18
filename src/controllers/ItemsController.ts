import * as express from 'express';
import { inject, injectable } from 'inversify';
import * as bodyParser from 'body-parser';

import { TYPES } from '../types';
import * as interfaces from '../interfaces';
import { ItemsService } from '../services/ItemsService';

@injectable()
export class ItemsController implements interfaces.IController {
    private itemsService: ItemsService;
    application: express.Application;

    constructor(@inject(TYPES.ItemsService) itemsService:ItemsService) {
        this.itemsService = itemsService;

        this.application = express();

        this.application.use(bodyParser.json());

        this.application.get('/items', this.getAll);
        this.application.get('/items/:id', this.get);
        this.application.post('/items', this.create);
        this.application.delete('/items/:id', this.delete);
        this.application.get('/items-trash', this.getDeletedAll);
    }

    getAll:express.RequestHandler = (request, response) => {
        this.itemsService.getAllItems().then((res) => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.send({
                statusCode: 500,
                data: e
            });
        });
    }

    getDeletedAll:express.RequestHandler = (request, response) => {
        this.itemsService.getDeletedItems().then(res => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.send({
                statusCode: 500,
                data: e
            });
        });
    }

    get:express.RequestHandler = (request, response) => {
        this.itemsService.getItem(parseInt(request.params.id)).then((res) => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.send({
                statusCode: 500,
                data: e
            });
        });
    }

    create:express.RequestHandler = (request, response) => {
        this.itemsService.createItem(request.body).then((res) => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.send({
                statusCode: 500,
                data: e
            });
        });
    }

    delete:express.RequestHandler = (request, response) => {
        this.itemsService.deleteItem(parseInt(request.params.id)).then((res) => {
            response.send({
                statusCode: 200,
                data: res
            });
        }).catch((e) => {
            response.send({
                statusCode: 500,
                data: e
            });
        });
    }
}