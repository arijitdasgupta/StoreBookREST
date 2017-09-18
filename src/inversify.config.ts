import { Container } from "inversify";
import "reflect-metadata";

import { TYPES } from "./types";
import  * as interfaces from "./interfaces";
import { UsersController } from "./controllers/UsersController";
import { UsersService } from "./services/UsersService";
import { PostgreSQL } from "./db/PostgreSQL";
import { SHA256Utils } from "./utils/SHA256Utils";

const container = new Container();
container.bind<PostgreSQL>(TYPES.PostgreSQL).to(PostgreSQL);
container.bind<UsersService>(TYPES.UsersService).to(UsersService);
container.bind<SHA256Utils>(TYPES.SHA256Utils).to(SHA256Utils);
container.bind<interfaces.IController>(TYPES.UsersController).to(UsersController);

export { container };