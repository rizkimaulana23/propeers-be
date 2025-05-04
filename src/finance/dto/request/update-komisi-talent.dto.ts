import { IsNumber, IsNotEmpty} from 'class-validator';

export class UpdateKomisiTalentDTO {
    @IsNotEmpty()
    @IsNumber()
    commissionAmount: number;


    @IsNotEmpty()
    projectId: number;

    @IsNotEmpty()
    talentId: number;
}