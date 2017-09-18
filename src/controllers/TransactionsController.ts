import { injectable, inject } from 'inversify';
import * as express from 'express';
import * as bodyParser from 'body-parser';

import { IController } from '../interfaces';
import { TYPES } from '../types';
import { TransactionsService } from '../services/TransactionsService';
import { TransactionTypes } from '../enums/TransactionTypes';

@injectable()
export class TransactionsController implements IController {
    application: express.Application;
    private transactionsService: TransactionsService

    constructor(@inject(TYPES.TransactionsService) transactionsService:TransactionsService) {
        this.transactionsService = transactionsService;

        this.application = express();

        this.application.use(bodyParser.json());

        this.application.get('/transactions', this.getAll);
        this.application.get('/transactions/:id', this.get);
        this.application.post('/transactions', this.post);
        this.application.get('/transaction-types', this.getTransactionTypes);
    }

    getAll:express.RequestHandler = (request, response) => {
        this.transactionsService.getAllTransactions().then(res => {
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

    get:express.RequestHandler = (request, response) => {
        this.transactionsService.getTransaction(request.params.id).then(res => {
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

    post:express.RequestHandler = (request, response) => {
        this.transactionsService.createTransaction(request.body).then(res => {
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

    getTransactionTypes:express.RequestHandler = (request, response) => {
        response.send(TransactionTypes);
    }
}