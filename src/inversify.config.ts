import { Container } from "inversify";
import * as inversify from "inversify";
import "reflect-metadata";

import { TYPES } from "./types";
import  * as appInterfaces from "./interfaces";
import { UsersController } from "./controllers/UsersController";
import { UsersService } from "./services/UsersService";
import { RabbitConnection } from "./rabbit/RabbitConnection";
import { RabbitChannel } from "./rabbit/RabbitChannel";
import { PostgreSQLPool } from "./db/PostgreSQLPool";
import { PostgresClient } from "./db/PostgresClient";
import { SHA256Utils } from "./utils/SHA256Utils";
import { UpdateQueryUtils } from "./utils/UpdateQueryUtils";
import { UUIDUtils } from "./utils/UUIDUtils";
import { UsersRepository } from "./repositories/UsersRepository";
import { ItemsRepository } from "./repositories/ItemsRepository";
import { ItemsService } from "./services/ItemsService";
import { ItemsController } from "./controllers/ItemsController";
import { TransactionsController } from "./controllers/TransactionsController";
import { TransactionsService } from "./services/TransactionsService";
import { TransactionsRepository } from "./repositories/TransactionsRepository";
import { IOHalter } from "./utils/IOHalter";
import * as env from './env';

const container = new Container();

// Used to stop all HTTP I/O till all promises are resolved...
container.bind<IOHalter>(TYPES.IOHalter).to(IOHalter).inSingletonScope();

container.bind<SHA256Utils>(TYPES.SHA256Utils).toConstantValue(new SHA256Utils(env.passwordSecret));
container.bind<UUIDUtils>(TYPES.UUIDUtils).toConstantValue(new UUIDUtils());
container.bind<PostgreSQLPool>(TYPES.PostgreSQLPool).toConstantValue(new PostgreSQLPool(env.DatabaseUrl));
container.bind<UpdateQueryUtils>(TYPES.UpdateQueryUtils).to(UpdateQueryUtils).inSingletonScope();
container.bind<RabbitConnection>(TYPES.RabbitTxConnection).toConstantValue(new RabbitConnection(env.RabbitTxUrl, 'TX'));
container.bind<RabbitConnection>(TYPES.RabbitRxConnection).toConstantValue(new RabbitConnection(env.RabbitRxUrl, 'RX'));

container.bind<RabbitChannel>(TYPES.RabbitTxChannel).toDynamicValue(context => new RabbitChannel(context.container.get<RabbitConnection>(TYPES.RabbitTxConnection)));
container.bind<RabbitChannel>(TYPES.RabbitRxChannel).toDynamicValue(context => new RabbitChannel(context.container.get<RabbitConnection>(TYPES.RabbitRxConnection)));

container.bind<PostgresClient>(TYPES.PostgresClient).to(PostgresClient);
container.bind<UsersService>(TYPES.UsersService).to(UsersService).inSingletonScope();
container.bind<appInterfaces.IController>(TYPES.UsersController).to(UsersController).inSingletonScope();
container.bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
container.bind<ItemsRepository>(TYPES.ItemsRepository).to(ItemsRepository).inSingletonScope();
container.bind<ItemsService>(TYPES.ItemsService).to(ItemsService).inSingletonScope();
container.bind<appInterfaces.IController>(TYPES.ItemsController).to(ItemsController).inSingletonScope();
container.bind<TransactionsService>(TYPES.TransactionsService).to(TransactionsService).inSingletonScope();
container.bind<TransactionsRepository>(TYPES.TransactionsRepository).to(TransactionsRepository).inSingletonScope();
container.bind<appInterfaces.IController>(TYPES.TransactionsController).to(TransactionsController).inSingletonScope();


export { container };