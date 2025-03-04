import { ChildEntity } from "typeorm";
import { User }from "../user.entity";

@ChildEntity('general_manager')
export default class GeneralManager extends User {

}