import { connect } from 'amqplib/callback_api';
import { Channel } from 'amqplib/callback_api';

import { RabbitConnection } from './RabbitConnection';
import { TYPES } from '../types';

export class RabbitChannel {
    channel: Channel;
    channelCreatePromise: Promise<Channel>;

    constructor(rabbitConnection:RabbitConnection) {
        this.channelCreatePromise = rabbitConnection.connectionCreatePromise.then((connection) => {
            return new Promise((resolve, reject) => {
                connection.createChannel((err, channel) => {
                    if (err) {
                        console.log('Failed to create channel for', rabbitConnection.mode, err);
                        reject(err);
                    } else {
                        console.log('Created RabbitMQ channel for ', rabbitConnection.mode);
                        this.channel = channel;
                        resolve(channel);
                    }
                });
            });
        });
    }
}