import { Body, Controller, Inject, Post } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { REQUEST } from '@nestjs/core';
import { CreateKomisiTalentDto } from './dto/request/create-komisi-talent.dto';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';

@Controller('finance')
export class FinanceController {

    constructor (
        private financeService: FinanceService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest,
    ){}

@Post('create-komisi')
  // @RolesDecorator(Role.DIREKSI)
  // @UseGuards(JwtAuthGuard)
    async createKomisiTalent(@Body() createKomisiTalent: CreateKomisiTalentDto) {
      const komisiBaru = await this.financeService.createKomisiTalent(createKomisiTalent);
      return new BaseResponseDto(
        this.request,
        'Berhasil membuat komisi',
        komisiBaru,
      );
    }
}

