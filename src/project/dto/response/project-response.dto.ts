import { ProjectStatus } from "src/common/entities/project.entity";
import { ProjectReferencesResponseDto } from "./project-references-response.dto";
import { ActivityResponseDto } from "./activity.dto";
import { BaseUserResponseDto } from "src/user/dto/response/user-response.dto";

export class ProjectResponseDto {
    id: number;

    projectName: string;

    description: string;

    startDate: Date;

    finishedDate: Date;

    fee: number;

    mou: string;

    canvaWhiteboard: string;

    boardPinterest: string;

    bonus: string;

    status: ProjectStatus;

    client: BaseUserResponseDto;

    references: ProjectReferencesResponseDto[];

    constructor(partial: Partial<ProjectResponseDto>) {
        Object.assign(this, partial);
    }
}