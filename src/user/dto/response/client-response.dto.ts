import { BaseUserResponseDto } from "./user-response.dto";

export class ClientResponseDto extends BaseUserResponseDto {
    activeProjects: number;
    successProjects: number;

    constructor(partial: Partial<ClientResponseDto>) {
        super(partial);
        Object.assign(this, partial);
    }
}