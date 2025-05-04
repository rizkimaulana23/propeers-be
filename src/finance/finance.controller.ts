import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
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

  @Put('update-komisi/:projectId/:talentId')
  // @RolesDecorator(Role.DIREKSI)
  // @UseGuards(JwtAuthGuard)
  async updateKomisiTalent(@Body() updateKomisiTalent: UpdateKomisiTalentDTO, @Param('projectId') idProject: number, @Param('talentId') idTalent: number) {
    const komisiUpdated = await this.financeService.updateKomisiTalent(updateKomisiTalent);
    return new BaseResponseDto(
      this.request,
      'Berhasil mengupdate komisi',
      komisiUpdated,
    );
  }

  @Put('update-transferred/:projectId/:talentId')
  // @RolesDecorator(Role.DIREKSI)
  // @UseGuards(JwtAuthGuard)
  async updateTransferredKomisi(@Param('projectId') projectId: number, @Param('talentId') talentId: number) {
    const komisiUpdated = await this.financeService.updateTransferredKomisi(projectId, talentId);
    return new BaseResponseDto(
      this.request,
      'Berhasil mengupdate transferred komisi',
      komisiUpdated,
    );
  }

  @Get('detail/:projectId')
  // @RolesDecorator(Role.DIREKSI)
  // @UseGuards(JwtAuthGuard)
  async detailProportionFinance(@Param('projectId') projectId: number) {
    const detailFinance = await this.financeService.detailFinanceProject(projectId);
    return new BaseResponseDto(
      this.request,
      'Berhasil mengambil detail finance',
      detailFinance,
    );
  }
}

