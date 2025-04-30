import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MinDate } from "class-validator";

export enum JenisPostingan {
    IG_FEED = 'Instagram Feed',
    IG_REELS = 'Instagram Reels',
    IG_STORY = 'Instagram Story',
    TT_POST = 'TikTok Post'
}

export enum ContentPillar {
    ENTERTAINMENT = 'Entertainment',
    PRODUCT_INFO = 'Product Information',
    EVENT = 'Event',
    GIVEAWAY = 'Giveaway'
} 

export enum TargetAudience {
    AWARENESS = 'Awareness',
    INTEREST = 'Interest',
    CONSIDERATION = 'Consideration',
    INTENT = 'Intent',
    EVALUATION = 'Evaluation',
    PURCHASE = 'Purchase'
}

export class CreateContentDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsOptional()
    caption: string;

    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
    @MinDate(new Date(), {
        message: 'Deadline must not be earlier than today'
    })
    deadline: Date;

    @IsEnum(JenisPostingan)
    @IsNotEmpty()
    type: JenisPostingan;

    @IsEnum(ContentPillar)
    @IsNotEmpty()
    pillar: ContentPillar;

    @IsEnum(TargetAudience)
    @IsNotEmpty()
    targetAudience: TargetAudience;

    @IsDateString()
    @IsNotEmpty()
    @Matches(/^\d{4}-\d{2}-\d{2}$/) 
    uploadDate: Date;

    @IsNumber()
    projectId: number;
}