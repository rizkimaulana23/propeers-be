import { ProjectStatus } from "src/common/entities/project.entity";
import { ProjectReferencesResponseDto } from "./project-references-response.dto";
import { ActivityResponseDto } from "./activity.dto";

export class ProjectResponseDto {
    id: string;

    projectName: string;

    startDate: Date;

    finishedDate: Date;

    fee: number;

    mou: string;

    status: ProjectStatus;

    projectReferences: ProjectReferencesResponseDto[];

    activity: ActivityResponseDto[];
}