import { connect } from 'amqplib/callback_api';
import { Connection } from 'amqplib/callback_api';
import { injectable, inject } from 'inversify';

import { TYPES } from '../types';

@injectable()
export class RabbitRxConnection {
    rabbitConnectionPromise: Promise<Connection>

    constructor() {
        // https://devcenter.heroku.com/articles/rabbitmq-bigwig
        const rabbitRxUrl = process.env.RABBITMQ_BIGWIG_RX_URL || 'amqp://localhost:5672';

        this.rabbitConnectionPromise = new Promise((resolve, reject) => {
            connect(rabbitRxUrl, (err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Connected to RabbitMQ RX');
                    resolve(conn);
                }
            });
        });
    }
}
