import * as express from 'express';
import * as expressLogger from 'express-logging';
import * as logger from 'logops';
import * as process from 'process';
import * as cors from 'cors';
import { Pool } from 'pg';

import * as interfaces from './interfaces';
import { container } from './inversify.config';
import { PostgresClient } from './db/PostgresClient';
import { TYPES } from './types';

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(expressLogger(logger));
app.use(cors({origin: true}));

container.get<PostgresClient>(TYPES.PostgresClient).clientConnectionPromise.then(_ => {
    const usersController = container.get<interfaces.IController>(TYPES.UsersController);
    const itemsController = container.get<interfaces.IController>(TYPES.ItemsController);
    const transcationsController = container.get<interfaces.IController>(TYPES.TransactionsController);

    app.use(usersController.application);
    app.use(itemsController.application);
    app.use(transcationsController.application);

    // Just a status endpoint
    app.get('/status', (request:express.Request, response:express.Response) => {
        response.send('OK');
    });

    app.listen(app.get('port'), () => {
        console.log(`Application is listening on PORT ${app.get('port')}`)
    });
});
