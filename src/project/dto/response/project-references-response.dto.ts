export class ProjectReferencesResponseDto {
    id: number;
    
    title: string;

    url: string;

    constructor(partial: Partial<ProjectReferencesResponseDto>) {
        Object.assign(this, partial);
    }
}