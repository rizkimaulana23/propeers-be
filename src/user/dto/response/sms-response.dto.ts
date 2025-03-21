import { BaseUserResponseDto } from "./user-response.dto";

export class SmsResponseDto extends BaseUserResponseDto {
    status: string
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;

    constructor(partial: Partial<SmsResponseDto>) {
        super(partial);
        Object.assign(this, partial);
    }
}