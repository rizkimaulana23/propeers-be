import { Body, Controller, Inject, Param, Post, Put } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { REQUEST } from '@nestjs/core';
import { CreateKomisiTalentDto } from './dto/request/create-komisi-talent.dto';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { UpdateKomisiTalentDTO } from './dto/request/update-komisi-talent.dto';

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

  @Put('update-komisi/:idProject/:idTalent')
  // @RolesDecorator(Role.DIREKSI)
  // @UseGuards(JwtAuthGuard)
  async updateKomisiTalent(@Body() updateKomisiTalent: UpdateKomisiTalentDTO, @Param('idProject') idProject: number, @Param('idTalent') idTalent: number) {
    const komisiUpdated = await this.financeService.updateKomisiTalent(updateKomisiTalent);
    return new BaseResponseDto(
      this.request,
      'Berhasil mengupdate komisi',
      komisiUpdated,
    );
  }
}

