export class SpecialityResponseDto {
    speciality: string;

    constructor(partial: Partial<SpecialityResponseDto>) {
        Object.assign(this, partial);
    }
}