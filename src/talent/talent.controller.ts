import { Body, Controller, Delete, Get, Inject, Param, Post, Query, Scope, UseGuards } from '@nestjs/common';
import { TalentService } from './talent.service';
import { CreateAssignedRoleDto } from './dto/request/create-assigned-role.dto';
// import { AssignedRoleResponseDto } from './dto/response/assigned-role-response.dto';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/entities/user.entity';

@Controller({ path: 'talent', scope: Scope.REQUEST})
export class TalentController {
    constructor(
        private talentService: TalentService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest
    ) {}
    
    @Post("assign-talent")
    // @RolesDecorator(Role.DIREKSI, Role.GM)
    // @UseGuards(JwtAuthGuard)
    async createAssignedRole(@Body() createAssignedRole: CreateAssignedRoleDto) {
        const assignedRole = await this.talentService.createAssignedRole(createAssignedRole);
        return new BaseResponseDto(this.request, 'User berhasil di-assign', assignedRole);
    }

}