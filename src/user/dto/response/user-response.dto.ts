import { Role } from "src/common/entities/user.entity";

export class BaseUserResponseDto {
    id: number;
    email: string;
    name: string;
    phone: string;
    description: string;
    role: Role;

    constructor(partial: Partial<BaseUserResponseDto>) {
        Object.assign(this, partial);
    }
}