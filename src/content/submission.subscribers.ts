import { Content } from "@/common/entities/content.entity";
import { Project } from "@/common/entities/project.entity";
import { Submission } from "@/common/entities/submission.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, EntitySubscriberInterface, InsertEvent, Repository, UpdateEvent } from "typeorm";

export class SubmissionSubscriber implements EntitySubscriberInterface<Submission> {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Project)
        private projectRepository: Repository<Project>,
        @InjectRepository(Submission)
        private submissionRepository: Repository<Submission>,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return Submission;
    }

    async afterInsert(event: InsertEvent<Submission>): Promise<void> {
        await this.updateProjectScore(event.entity);
    }

    async afterUpdate(event: UpdateEvent<Submission>): Promise<void> {
        await this.updateProjectScore(event.databaseEntity);
    }

    async updateProjectScore(submission: Submission) {
        let score = 0;

        const content = await this.dataSource
            .getRepository(Content)
            .findOne({
                where: { id: submission.contentId }
            });

        if (!content || !content.projectId) {
            return;
        }

        const existingSubmissions = await this.submissionRepository
            .createQueryBuilder('s')
            .innerJoin('content', 'c', 'c.id = s.contentId')
            .innerJoin('projects', 'p', 'p.id = c.projectId')
            .where('c.projectId = :projectId', { projectId: content.projectId })
            .getMany();

        const allSubmissions = [...existingSubmissions];
        const isNewSubmissionIncluded = existingSubmissions.some(s => s.id === submission.id);

        if (!isNewSubmissionIncluded) {
            allSubmissions.push(submission);
        }

        const submissionCount = allSubmissions.length;

        const onTimeSubmissions = allSubmissions.filter(s => s.durasiOnTime !== null && s.durasiOnTime >= 0);
        const onTimeSubmissionsCount = onTimeSubmissions.length;

        if (submissionCount > 0) {
            score = Math.ceil((onTimeSubmissionsCount / submissionCount) * 100);
        } else {
            score = 0;
        }

        const project = await this.projectRepository.findOne({
            where: {
                id: content.projectId
            }
        });

        if (project) {
            project.score = score;
            await this.projectRepository.save(project);
        }

    }
}