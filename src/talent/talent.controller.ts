import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { TalentService } from './talent.service';
import { CreateAssignedRoleDto } from './dto/request/create-assigned-role.dto';
// import { AssignedRoleResponseDto } from './dto/response/assigned-role-response.dto';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/entities/user.entity';

@Controller({ path: 'talent', scope: Scope.REQUEST })
export class TalentController {
  constructor(
    private talentService: TalentService,
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  @Post('assign-talent')
  // @RolesDecorator(Role.DIREKSI, Role.GM)
  // @UseGuards(JwtAuthGuard)
  async createAssignedRole(@Body() createAssignedRole: CreateAssignedRoleDto) {
    const assignedRole =
      await this.talentService.createAssignedRole(createAssignedRole);
    return new BaseResponseDto(
      this.request,
      'User berhasil di-assign',
      assignedRole,
    );
  }

  @Get()
  // @RolesDecorator(Role.DIREKSI, Role.GM)
  // @UseGuards(JwtAuthGuard)
  async readTalents() {
    const result = await this.talentService.readTalents();
    return new BaseResponseDto(
      this.request,
      'List Talent Berhasil didapatkan',
      result,
    );
  }

  @Get('project')
  // @UseGuards(JwtAuthGuard)
  async readTalentsbyProject(@Query('projectId') projectId: number) {
    const result = await this.talentService.readTalentsbyProject(projectId);
    return new BaseResponseDto(
      this.request,
      `List Talent pada Project dengan ID ${projectId} berhasil didapatkan`,
      result,
    );
  }

  @Get('detail')
  // @RolesDecorator(Role.DIREKSI, Role.GM)
  // @UseGuards(JwtAuthGuard)
  async readTalent(@Query('talentId') talentId: number) {
    const result = await this.talentService.readTalent(talentId);
    return new BaseResponseDto(
      this.request,
      `Talent Detail dengan ID ${talentId} berhasil didapatkan`,
      result,
    );
  }

  @Delete('unassign-talent')
  // @RolesDecorator(Role.DIREKSI, Role.GM)
  // @UseGuards(JwtAuthGuard)
  async deleteAssignedRole(@Query('talentId') talentId: number, @Query('projectId') projectId: number) {
    await this.talentService.deleteAssignedRole(talentId, projectId);
    return new BaseResponseDto(this.request, 'User berhasil di-unassign', null);
  }
}
