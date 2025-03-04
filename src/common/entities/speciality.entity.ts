import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";

@Entity('specialities')
export class Speciality extends BaseEntity {
    @Column({ nullable: false })
    name: string;

    @ManyToMany(() => User, (user) => user.specialities)
    @JoinColumn({ name: 'userId' })
    users: User[];

    @Column({ nullable: true })
    userId: number;
}