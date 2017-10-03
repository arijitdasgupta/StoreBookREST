import { Container } from "inversify";
import "reflect-metadata";

import { TYPES } from "./types";
import  * as interfaces from "./interfaces";
import { UsersController } from "./controllers/UsersController";
import { UsersService } from "./services/UsersService";
import { PostgreSQL } from "./db/PostgreSQL";
import { RabbitTxConnection } from "./rabbit/RabbitTxConnection";
import { RabbitRxConnection } from "./rabbit/RabbitRxConnection";
import { PostgresClient } from "./db/PostgresClient";
import { SHA256Utils } from "./utils/SHA256Utils";
import { UpdateQueryUtils } from "./utils/UpdateQueryUtils";
import { UsersRepository } from "./repositories/UsersRepository";
import { ItemsRepository } from "./repositories/ItemsRepository";
import { ItemsService } from "./services/ItemsService";
import { ItemsController } from "./controllers/ItemsController";
import { TransactionsController } from "./controllers/TransactionsController";
import { TransactionsService } from "./services/TransactionsService";
import { TransactionsRepository } from "./repositories/TransactionsRepository";

const container = new Container();
container.bind<RabbitTxConnection>(TYPES.RabbitTxConnection).to(RabbitTxConnection).inSingletonScope();
container.bind<RabbitRxConnection>(TYPES.RabbitRxConnection).to(RabbitRxConnection).inSingletonScope();
container.bind<PostgreSQL>(TYPES.PostgreSQL).to(PostgreSQL).inSingletonScope();
container.bind<PostgresClient>(TYPES.PostgresClientForRepositories).to(PostgresClient).inSingletonScope();
container.bind<UsersService>(TYPES.UsersService).to(UsersService).inSingletonScope();
container.bind<SHA256Utils>(TYPES.SHA256Utils).to(SHA256Utils).inSingletonScope();
container.bind<interfaces.IController>(TYPES.UsersController).to(UsersController).inSingletonScope();
container.bind<UpdateQueryUtils>(TYPES.UpdateQueryUtils).to(UpdateQueryUtils).inSingletonScope();
container.bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
container.bind<ItemsRepository>(TYPES.ItemsRepository).to(ItemsRepository).inSingletonScope();
container.bind<ItemsService>(TYPES.ItemsService).to(ItemsService).inSingletonScope();
container.bind<interfaces.IController>(TYPES.ItemsController).to(ItemsController).inSingletonScope();
container.bind<TransactionsService>(TYPES.TransactionsService).to(TransactionsService).inSingletonScope();
container.bind<TransactionsRepository>(TYPES.TransactionsRepository).to(TransactionsRepository).inSingletonScope();
container.bind<interfaces.IController>(TYPES.TransactionsController).to(TransactionsController).inSingletonScope();


export { container };