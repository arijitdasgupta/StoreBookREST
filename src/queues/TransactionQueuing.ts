import { injectable, inject } from 'inversify';
import { Channel } from 'amqplib/callback_api';

import { IOHalter } from '../utils/IOHalter';
import { RabbitChannel } from '../rabbit/RabbitChannel';
import { TYPES } from '../types';
import { Queues } from '../enums/Queues';

interface IQueueObject {
    uuid: string,
    transcationObject: any;
}

interface ITransactionPostQueueingObject<T> {
    transactionObject: T, 
    ackFunk: () => void, 
    uuid: string
}

@injectable()
export class TransactionQueuing {
    private transactionHashtable: any;
    private rabbitTxChannel: Channel;
    private rabbitRxChannel: Channel;

    constructor(@inject(TYPES.IOHalter) ioHalter:IOHalter,
                @inject(TYPES.RabbitRxChannel) rabbitRxChannel:RabbitChannel,
                @inject(TYPES.RabbitTxChannel) rabbitTxChannel:RabbitChannel) {
        ioHalter.addPromise(rabbitTxChannel.channelCreatePromise.then(channel => {
            this.rabbitTxChannel = channel;
            channel.assertQueue(Queues.transactionQueue);
        }));

        ioHalter.addPromise(rabbitRxChannel.channelCreatePromise.then(channel => {
            this.rabbitRxChannel = channel;
            this.rabbitRxChannel.prefetch(1);
            channel.assertQueue(Queues.transactionQueue);
            this.initiateConsumer();
        }));

        this.transactionHashtable = {};
    }

    initiateConsumer = () => {
        this.rabbitRxChannel.consume(Queues.transactionQueue, (msg) => {
            const msgString = msg.content.toString();
            const msgObject = JSON.parse(msgString) as IQueueObject;

            if (this.transactionHashtable.hasOwnProperty(msgObject.uuid)) {
                this.transactionHashtable[msgObject.uuid].resolve({
                    transactionObject: msgObject.transcationObject,
                    ackFunk: () => this.rabbitRxChannel.ack(msg),
                    uuid: msgObject.uuid
                });

                delete this.transactionHashtable[msgObject.uuid];
            } else {
                this.rabbitRxChannel.nack(msg, true);
            }
        });
    }

    createNewTransaction = <T>(uuid: string, transcationObject: T): Promise<ITransactionPostQueueingObject<T>> => {
        let promiseResolve, promiseReject;

        const promise = new Promise<ITransactionPostQueueingObject<T>>((resolve, reject) => {
            promiseResolve = resolve;
            promiseReject = reject;
        });

        this.transactionHashtable[uuid] = {
            resolve: promiseResolve,
            reject: promiseReject
        };

        const queueObject = {uuid, transcationObject} as IQueueObject;

        this.rabbitTxChannel.sendToQueue(Queues.transactionQueue, Buffer.from(JSON.stringify(queueObject)));
        return promise;
    }
}