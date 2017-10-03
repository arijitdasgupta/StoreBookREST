import { connect } from 'amqplib/callback_api';
import { Connection, Channel } from 'amqplib/callback_api';

export class RabbitConnection {
    connection: Connection;
    channel: Channel;
    connectionCreatePromise: Promise<Connection>;
    channelCreatePromise: Promise<Channel>;

    // mode is purely ornamental...
    constructor(rabbitUrl: string, mode = '') {
        this.connectionCreatePromise = new Promise((resolve, reject) => {
            connect(rabbitUrl, (err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    this.connection = conn;
                    resolve(conn);
                }
            });
        });

        this.channelCreatePromise = this.connectionCreatePromise.then((connection) => {
            return new Promise((resolve, reject) => {
                connection.createChannel((err, channel) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.channel = channel;
                        console.log(`Initiated RabbitMQ channel for ${mode}`);
                        resolve(channel);
                    }
                })
            });
        });
    }
}