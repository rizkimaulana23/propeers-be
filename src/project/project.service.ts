import { Inject, Injectable } from '@nestjs/common';
import { Project } from 'src/common/entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/request/create-project.dto';
import { ProjectReferences } from 'src/common/entities/projectReferences.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(Project)
        private readonly projectRepository: Repository<Project>,
        @InjectRepository(ProjectReferences)
        private readonly projectReferencesRepository: Repository<ProjectReferences>,
    ) {}

    async createProject(createProjectDto: CreateProjectDto) {
        const { name, startDate, finishedDate, fee, mou } = createProjectDto;
        const project = this.projectRepository.create({
            projectName: name,
            startDate,
            finishedDate,
            fee,
            mou
        })
        return await this.projectRepository.save(project);
    }

    turnProjectIntoProjectResponse () {

    }
}
