import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { RolesDecorator } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/common/entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { DashboardService } from './dashboard.service';
import { AuthenticatedRequest } from 'src/common/interfaces/custom-request.interface';
import { REQUEST } from '@nestjs/core';
import { TaskCalendarResponseDto } from './dto/TaskCalendarResponseDto';
import { BaseResponseDto } from 'src/common/dto/success-response.dto';
import { TalentPieChartResponseDto } from './dto/TalentPieChart';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        @Inject(REQUEST) private readonly request: AuthenticatedRequest
    ) {}

    @Get('summary-active-project-bar')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Role.DIREKSI, Role.SMS)
    async getSummaryActiveProject() {
        const result = await this.dashboardService.getSummaryActiveProject();
        return new BaseResponseDto(this.request, "Summary Active Project data successfully fetched", result);
    }

    @Get('income-chart')
    @UseGuards(JwtAuthGuard)
    async getIncomeChart() {
        const result = await this.dashboardService.getIncomeLineChart();
        return new BaseResponseDto(this.request, "Income Chart Data successfully fetched", result);
    }

    @Get('deliverable-chart')
    @UseGuards(JwtAuthGuard)
    async getDeliverableBarChart() {
        const result = await this.dashboardService.getDeliverableChart();
        return new BaseResponseDto(this.request, "Deliverable Chart data fetched successfully.", result);
    }

    @Get('monthly-project-chart')
    @UseGuards(JwtAuthGuard)
    async getProjectPerMonthBarChart() {
        const result = await this.dashboardService.getMonthlyProjectBarChart();
        return new BaseResponseDto(this.request, "Monthly Project Bar Chart data fetched succesfully.", result);
    }

    @Get('active-talent-pie-chart')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Role.DIREKSI, Role.GM)
    async getActiveTalentPieChart() {
        const result: TalentPieChartResponseDto[] = await this.dashboardService.getActiveTalentPieChart();
        return new BaseResponseDto(this.request, "Active Talent Pie Chart data fetched successfully.", result);
    }

    @Get('task-calendar')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @RolesDecorator(Role.DIREKSI, Role.FREELANCER, Role.SMS)
    async getTaskCalendar () {
        const result: TaskCalendarResponseDto[] = await this.dashboardService.getTaskCalendar();
        return new BaseResponseDto(this.request, "Task Calendar data fetched successfully.", result);
    }

    @Get('card')    
    @UseGuards(JwtAuthGuard)
    async getCardData() {
        const result = await this.dashboardService.getCardData();
        return new BaseResponseDto(this.request, "Card Date fetched successfully.", result);
    }

    @Get('speciality-comparison')
    @UseGuards(JwtAuthGuard)
    async getSpecialityComparison() {
        const result = await this.dashboardService.getSpecialityComparison();
        return new BaseResponseDto(this.request, "Speciality Comparison Date fetched successfully.", result);
    }
}
