import { IsUrl } from "class-validator";

export class UploadContentDto {

    @IsUrl()
    uploadLink: string;
}