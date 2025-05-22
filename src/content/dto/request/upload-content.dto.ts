import { IsUrl, ValidateIf } from "class-validator";

export class UploadContentDto {

    @ValidateIf((o) => o.uploadLink !== null && o.uploadLink !== undefined && o.uploadLink !== '')
    @IsUrl()
    uploadLink: string;
}