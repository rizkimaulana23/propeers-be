import { ProjectResponseDto } from "src/project/dto/response/project-response.dto";
import { ContentPillar, JenisPostingan } from "../request/create-content.dto";

export class ContentResponseDto {

        id: number;

        title: string;

        deadline: Date;
    
        type: JenisPostingan;
    
        pillar: ContentPillar;
    
        uploadDate: Date;
    
        viewsAmount: number;
    
        likesAmount: number;
    
        commentAmount: number;
    
        shareAmount: number;

        project: ProjectResponseDto;

        constructor(partial: Partial<ContentResponseDto>) {
            Object.assign(this, partial);
        }
}