import {UserController} from "./controllers/userController";
import {pool} from "./config/database";

const userController = new UserController(pool);

const user = userController.login('admin', 'admin');
console.log(user)
