import { Request } from 'express';

export class BaseResponseDto<T> {
    path: string;
    timestamp: Date;
    message: string;
    result: T;

    constructor(request: Request, message: string, result: T) {
        this.path = request.path;
        this.timestamp = new Date();
        this.message = message;
        this.result = result;
    }
}