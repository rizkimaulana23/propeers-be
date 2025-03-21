import { ProjectResponseDto } from "src/project/dto/response/project-response.dto";
import { BaseUserResponseDto } from "src/user/dto/response/user-response.dto";

export class CommissionResponseDTO {
    id: number;

    commisionAmount: number;

    project: ProjectResponseDto;

    talent: BaseUserResponseDto;

    constructor(partial: Partial<CommissionResponseDTO>) {
        Object.assign(this, partial);
    }
}