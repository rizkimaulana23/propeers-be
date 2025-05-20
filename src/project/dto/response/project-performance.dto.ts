export interface ProjectPerformanceResponseDto {
    contentId: number;
    contentName: string;
    daysLate: number | null;
    daysOnTime: number | null;
    submittedDate: Date;
}