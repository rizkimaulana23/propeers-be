import { Column, Entity, JoinColumn, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "../base.entity";
import { Commission } from "../commission.entity";
import { Speciality } from "../speciality.entity";
import { JoinAttribute } from "typeorm/query-builder/JoinAttribute";
import AssignedRoles from "../assignedRoles.entity";

export enum TalentType {
    SMS = 'SMS',
    FREELANCER = 'FREELANCER'
}

@Entity('talent')
export class Talent extends BaseEntity {

    @Column({ nullable: false })
    status: string;

    @Column({ nullable: true })
    bankName: string;

    @Column({ nullable: true })
    bankAccountNumber: string;

    @Column({ nullable: true })
    bankAccountName: string;

    @Column({ nullable: false, type: 'enum', enum: TalentType })
    type: TalentType;

    @OneToMany(() => Commission, (commission) => commission.talent)
    commissions: Commission[];

    @ManyToMany(() => Speciality, (speciality) => speciality.talents)
    @JoinColumn({ name: 'specialityId' })
    specialities: Speciality[];

    @Column({ nullable: true })
    specialityId: number;

    @OneToMany(() => AssignedRoles, (assignedRoles) => assignedRoles.talent)
    assignedRoles: AssignedRoles[];
}