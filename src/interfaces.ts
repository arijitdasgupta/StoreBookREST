import * as express from 'express';
import { Channel, Connection } from 'amqplib/callback_api';

export interface IController {
    application: express.Application;
}