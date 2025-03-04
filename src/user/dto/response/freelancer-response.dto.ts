import { SpecialityResponseDto } from "./speciality-response.dto";
import { BaseUserResponseDto } from "./user-response.dto";

export class FreelancerResponseDto extends BaseUserResponseDto {
    status: string
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    specialities: SpecialityResponseDto[];

    constructor(partial: Partial<FreelancerResponseDto>) {
        super(partial);
        Object.assign(this, partial);
    }
}