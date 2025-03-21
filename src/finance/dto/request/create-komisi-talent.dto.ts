import { IsNumber, IsNotEmpty} from 'class-validator';

export class CreateKomisiTalentDto {
    @IsNotEmpty()
    @IsNumber()
    commissionAmount: number;

    @IsNotEmpty()
    talentId: number;

    @IsNotEmpty()
    projectId: number;
}