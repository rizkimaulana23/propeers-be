import { IsNumber, IsNotEmpty} from 'class-validator';

export class CreateKomisiTalentDto {
    @IsNotEmpty()
    @IsNumber()
    commissionAmount: number;

    @IsNotEmpty()
    projectId: number;
    
    @IsNotEmpty()
    talentId: number;
}