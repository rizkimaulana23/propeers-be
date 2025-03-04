import { ChildEntity } from "typeorm";
import { User }from "../user.entity";

@ChildEntity('client')
export default class Client extends User {
    
}