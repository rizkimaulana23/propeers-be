import { BaseUserResponseDto } from "src/user/dto/response/user-response.dto";

export class DetailTalentResponseDTO extends BaseUserResponseDto {
    activeProject: number;
    successProject: number;
    status: string
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    specialities: string[];
    assignedRoles: any;

    constructor(partial: Partial<DetailTalentResponseDTO>) {
        super(partial);
        Object.assign(this, partial);
    }
}