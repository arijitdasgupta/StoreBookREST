import * as express from 'express';
import * as expressLogger from 'express-logging';
import * as logger from 'logops';
import * as process from 'process';
import * as cors from 'cors';
import { Pool } from 'pg';

import * as interfaces from './interfaces';
import { container } from './inversify.config';
import { IOHalter } from './utils/IOHalter';
import { TYPES } from './types';
import { NodePort } from './env';

const app = express();

app.set('port', NodePort);

app.use(expressLogger(logger));
app.use(cors({origin: true}));

const initApplication = () => {
    app.listen(app.get('port'), () => {
        console.log(`Application is listening on PORT ${app.get('port')}`)
    });
};

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

const ioHalter = container.get<IOHalter>(TYPES.IOHalter);

Promise.all(ioHalter.getAllPromises()).then(initApplication);




