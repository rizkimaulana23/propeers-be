
export class BaseUserResponseDto {
    id: number;
    email: string;
    name: string;
    phone: string;
    description: string;

    constructor(partial: Partial<BaseUserResponseDto>) {
        Object.assign(this, partial);
    }
}