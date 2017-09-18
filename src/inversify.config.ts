import { Container } from "inversify";
import "reflect-metadata";

import { TYPES } from "./types";
import  * as interfaces from "./interfaces";
import { UsersController } from "./controllers/UsersController";
import { UsersService } from "./services/UsersService";
import { PostgreSQL } from "./db/PostgreSQL";
import { SHA256Utils } from "./utils/SHA256Utils";
import { UpdateQueryUtils } from "./utils/UpdateQueryUtils";
import { UsersRepository } from "./repositories/UsersRepository";
import { ItemsRepository } from "./repositories/ItemsRepository";

const container = new Container();
container.bind<PostgreSQL>(TYPES.PostgreSQL).to(PostgreSQL).inSingletonScope();
container.bind<UsersService>(TYPES.UsersService).to(UsersService).inSingletonScope();
container.bind<SHA256Utils>(TYPES.SHA256Utils).to(SHA256Utils).inSingletonScope();
container.bind<interfaces.IController>(TYPES.UsersController).to(UsersController).inSingletonScope();
container.bind<UpdateQueryUtils>(TYPES.UpdateQueryUtils).to(UpdateQueryUtils).inSingletonScope();
container.bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
container.bind<ItemsRepository>(TYPES.ItemsRepository).to(ItemsRepository).inSingletonScope();

export { container };