import { connect } from 'amqplib/callback_api';
import { Connection, Channel } from 'amqplib/callback_api';

export class RabbitConnection {
    connection: Connection;
    connectionCreatePromise: Promise<Connection>;
    mode: string;

    // mode is purely ornamental...
    constructor(rabbitUrl: string, mode = 'nuthing!') {
        this.mode = mode;

        this.connectionCreatePromise = new Promise((resolve, reject) => {
            connect(rabbitUrl, (err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    this.connection = conn;
                    console.log(`Initiated RabbitMQ connection for ${mode}`);
                    resolve(conn);
                }
            });
        });
    }
}