import { ChildEntity } from "typeorm";
import { User }from "../user.entity";

@ChildEntity('direksi')
export default class Direksi extends User  {

}