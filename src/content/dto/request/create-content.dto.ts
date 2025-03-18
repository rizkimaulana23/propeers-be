import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from "class-validator";

export enum JenisPostingan {
    IG_FEED = 'IG_FEED',
    IG_REELS = 'IG_REELS',
    IG_STORY = 'IG_STORY',
    TT_POST = 'TT_POST'
}

export enum ContentPillar {
    ENTERTAINMENT = 'ENTERTAINMENT',
    PRODUCT_INFO = 'PRODUCT_INFO',
    EVENT = 'EVENT',
    GIVEAWAY = 'GIVEAWAY'
} 
export class CreateContentDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    deadline: Date;

    @IsEnum(JenisPostingan)
    @IsNotEmpty()
    type: JenisPostingan;

    @IsEnum(ContentPillar)
    @IsNotEmpty()
    pillar: ContentPillar;

    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/) 
    uploadDate: Date;

    @IsNumber()
    @IsOptional()
    viewsAmount: number;

    @IsNumber()
    @IsOptional()
    likesAmount: number;

    @IsNumber()
    @IsOptional()
    commentAmount: number;

    @IsNumber()
    @IsOptional()
    shareAmount: number;

    @IsNumber()
    projectId: number;
}