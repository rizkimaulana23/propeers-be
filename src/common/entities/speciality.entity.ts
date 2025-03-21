import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity('specialities')
export class Speciality {
    @PrimaryColumn()
    speciality: string;

    @ManyToMany(() => User, (user) => user.specialities)
    users: User[];
}