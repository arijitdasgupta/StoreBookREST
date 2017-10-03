// import { connect } from 'amqplib/callback_api';
import { injectable, inject } from 'inversify';

import { TYPES } from '../types';

@injectable()
export class RabbitTxClient {
    rabbitTxUrl: string;
    rabbitRxUrl: string;

    constructor() {
        this.rabbitTxUrl = process.env.RABBITMQ_BIGWIG_RX_URL || 'amqp://localhost:5672';
        this.rabbitRxUrl = null;

        // connect(this.rabbitTxUrl, (err, conn) => {
        //     console.log(err);
        //     console.log('connected to RabbitMQ');
        // });
    }
}
