import { connect } from 'amqplib/callback_api';
import { Connection } from 'amqplib/callback_api';
import { injectable, inject } from 'inversify';

import { TYPES } from '../types';

@injectable()
export class RabbitTxConnection {
    rabbitConnectionPromise: Promise<Connection>

    constructor() {
        // https://devcenter.heroku.com/articles/rabbitmq-bigwig
        const rabbitTxUrl = process.env.RABBITMQ_BIGWIG_TX_URL || 'amqp://localhost:5672';

        this.rabbitConnectionPromise = new Promise((resolve, reject) => {
            connect(rabbitTxUrl, (err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connected to RabbitMQ TX');
                    resolve(conn);
                }
            });
        });
    }
}
