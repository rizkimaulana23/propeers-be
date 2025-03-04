import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./user.entity";
import { Talent } from "./user/talent.entity";

@Entity('specialities')
export class Speciality extends BaseEntity {
    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    speciality: string;

    @ManyToMany(() => Talent, (talent) => talent.specialities)
    @JoinColumn({ name: 'talentId' })
    talents: Talent[];

    @Column({ nullable: true })
    talentId: number;
}