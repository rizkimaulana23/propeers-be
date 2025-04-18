import { IsNumber, IsNotEmpty} from 'class-validator';

export class UpdateKomisiTalentDTO {
    @IsNotEmpty()
    @IsNumber()
    commissionAmount: number;

    @IsNotEmpty()
    talentId: number;

    @IsNotEmpty()
    projectId: number;
}