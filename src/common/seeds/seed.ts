// src/common/seeds/seed.ts
import { createConnection, DataSource } from 'typeorm';
import { Role, User } from '../../common/entities/user.entity';
import { Project, ProjectStatus } from '../../common/entities/project.entity';
import { Speciality } from '../../common/entities/speciality.entity';
import { Notification, NotificationStatus } from '../../common/entities/notification.entity';
import { Deliverable } from '../../common/entities/deliverables.entity';
import { ContentPlan } from '../../common/entities/contentPlan.entity';
import { Commission } from '../../common/entities/commission.entity';
import { Talent, TalentType } from '../../common/entities/user/talent.entity';
import { faker } from '@faker-js/faker';
import { Submission } from '../entities/submission.entity';
import AssignedRoles from '../entities/assignedRoles.entity';
import { ProjectReferences } from '../entities/projectReferences.entity';
import { Activity } from '../entities/activity.entity';

const connection = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 3001,
    username: 'postgres',
    password: 'test',
    database: 'artesa_db',
    entities: [User, Project, Speciality, Notification, Deliverable, ContentPlan, Commission, Talent, Submission, AssignedRoles, ProjectReferences, Activity],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
});

async function seedDatabase() {
    await connection.initialize();
    const userRepository = connection.getRepository(User);
    const projectRepository = connection.getRepository(Project);
    const specialityRepository = connection.getRepository(Speciality);
    const notificationRepository = connection.getRepository(Notification);
    const deliverableRepository = connection.getRepository(Deliverable);
    const contentPlanRepository = connection.getRepository(ContentPlan);
    const commissionRepository = connection.getRepository(Commission);
    const talentRepository = connection.getRepository(Talent);
    const assignedRolesRepository = connection.getRepository(AssignedRoles);
    const projectReferencesRepository = connection.getRepository(ProjectReferences);
    const activityRepository = connection.getRepository(Activity);

    // Generate Users
    const users = Array.from({ length: 10 }).map(() => {
        const user = new User();
        user.email = faker.internet.email();
        user.hashedPassword = faker.internet.password(); // You might want to hash this
        user.name = faker.name.fullName();
        user.phone = faker.phone.number();
        user.description = faker.lorem.sentence();
        user.role = faker.helpers.arrayElement(Object.values(Role));
        return user;
    });
    await userRepository.save(users);

    // Generate Projects
    const projects = Array.from({ length: 5 }).map(() => {
        const project = new Project();
        project.projectName = faker.company.name();
        project.startDate = faker.date.past();
        project.finishedDate = faker.date.future();
        project.fee = parseFloat(faker.finance.amount());
        project.mou = faker.lorem.sentence();
        project.status = faker.helpers.arrayElement(Object.values(ProjectStatus));
        project.clientId = faker.helpers.arrayElement(users).id; // Assuming user has an id
        return project;
    });
    await projectRepository.save(projects);

    // Generate Specialities
    const specialities = Array.from({ length: 5 }).map(() => {
        const speciality = new Speciality();
        speciality.name = faker.commerce.department();
        speciality.speciality = faker.commerce.product();
        return speciality;
    });
    await specialityRepository.save(specialities);

    // Generate Notifications
    // const notifications = Array.from({ length: 10 }).map(() => {
    //     const notification = new Notification();
    //     notification.message = faker.lorem.sentence();
    //     notification.status = faker.helpers.arrayElement(Object.values(NotificationStatus));
    //     notification.senderId = faker.helpers.arrayElement(users).id; // Assuming user has an id
    //     notification.userId = faker.helpers.arrayElement(users).id; // Assuming user has an id
    //     return notification;
    // });
    // await notificationRepository.save(notifications);

    // Generate Content Plans
    const contentPlans = Array.from({ length: 5 }).map(() => {
        const contentPlan = new ContentPlan();
        contentPlan.pinterestBoardUrl = faker.internet.url();
        contentPlan.whiteboardUrl = faker.internet.url();
        contentPlan.projectId = faker.helpers.arrayElement(projects).id; // Assuming project has an id
        return contentPlan;
    });
    await contentPlanRepository.save(contentPlans);

    // Generate Deliverables
    const deliverables = Array.from({ length: 5 }).map(() => {
        const deliverable = new Deliverable();
        deliverable.title = faker.lorem.sentence();
        deliverable.deadline = faker.date.future();
        deliverable.type = faker.commerce.product();
        deliverable.pillar = faker.commerce.department();
        deliverable.uploadDate = new Date();
        deliverable.status = faker.helpers.arrayElement(['PENDING', 'COMPLETED']);
        deliverable.contentPlanId = faker.helpers.arrayElement([1, 2, 3]); // Assuming content plans exist
        return deliverable;
    });
    await deliverableRepository.save(deliverables);

    // Generate Commissions
    const commissions = Array.from({ length: 5 }).map(() => {
        const commission = new Commission();
        commission.commissionAmount = parseFloat(faker.finance.amount());
        commission.projectId = faker.helpers.arrayElement(projects).id; // Assuming project has an id
        commission.talentId = faker.helpers.arrayElement([1, 2, 3]); // Assuming talents exist
        return commission;
    });
    await commissionRepository.save(commissions);

    // Generate Talents
    const talents = Array.from({ length: 5 }).map(() => {
        const talent = new Talent();
        talent.status = faker.helpers.arrayElement(['ACTIVE', 'INACTIVE']);
        talent.bankName = faker.company.name();
        talent.bankAccountNumber = faker.finance.accountNumber();
        talent.bankAccountName = faker.helpers.arrayElement(['BRI', 'BCA', 'MANDIRI', 'JAGO']);
        talent.type = faker.helpers.arrayElement(Object.values(TalentType));
        return talent;
    });
    await talentRepository.save(talents);

    // Generate Assigned Roles
    const assignedRoles = Array.from({ length: 5 }).map(() => {
        const role = new AssignedRoles();
        role.role = faker.lorem.word();
        role.briefNotesUrl = faker.internet.url();
        role.talentId = faker.helpers.arrayElement(talents).id; // Assuming talent has an id
        role.projectId = faker.helpers.arrayElement(projects).id; // Assuming project has an id
        return role;
    });
    await assignedRolesRepository.save(assignedRoles);

    // Generate Project References
    const projectReferences = Array.from({ length: 5 }).map(() => {
        const reference = new ProjectReferences();
        reference.title = faker.lorem.sentence();
        reference.type = faker.lorem.word();
        reference.url = faker.internet.url();
        reference.projectId = faker.helpers.arrayElement(projects).id; // Assuming project has an id
        return reference;
    });
    await projectReferencesRepository.save(projectReferences);

    // Generate Activities
    const activities = Array.from({ length: 5 }).map(() => {
        const activity = new Activity();
        activity.title = faker.lorem.sentence();
        activity.date = faker.date.future();
        activity.description = faker.lorem.sentence();
        activity.projectId = faker.helpers.arrayElement(projects).id; // Assuming project has an id
        return activity;
    });
    await activityRepository.save(activities);

    console.log('Database seeded successfully!');
    await connection.close();
}

seedDatabase().catch(console.error);