export class TalentPerformanceResponseDTO {
    userId: number;
    email: string;
    name: string;
    totalLateSubmissions: number;
    totalOnTimeSubmissions: number;
    overallScore: number;

    constructor(partial: Partial<TalentPerformanceResponseDTO>) {
        Object.assign(this, partial);
    }
}
