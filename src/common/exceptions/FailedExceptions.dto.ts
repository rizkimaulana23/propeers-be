import { HttpException, HttpStatus } from "@nestjs/common";

export class FailedException extends HttpException {
    constructor(message: string, status: HttpStatus, path: string, error?: string) {
        const response = {
            timestamp: new Date().toISOString(),
            status: status,
            error: error,
            message: message,
            path: path,
        };
        super(response, status);
    }
}