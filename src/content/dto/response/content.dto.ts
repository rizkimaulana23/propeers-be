import { ProjectResponseDto } from "src/project/dto/response/project-response.dto";
import { ContentPillar, JenisPostingan, TargetAudience } from "../request/create-content.dto";

export class ContentResponseDto {

        id: number;

        title: string;

        description: string;

        caption: string;

        deadline: Date;
    
        type: JenisPostingan;
    
        pillar: ContentPillar;

        targetAudience: TargetAudience;
    
        uploadDate: Date;

        status: string;
    
        viewsAmount: number;
    
        likesAmount: number;
    
        commentAmount: number;
    
        shareAmount: number;

        project: ProjectResponseDto;

        constructor(partial: Partial<ContentResponseDto>) {
            Object.assign(this, partial);
        }
}