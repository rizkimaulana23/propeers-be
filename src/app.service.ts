import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Speciality } from './common/entities/speciality.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(
    @InjectRepository(Speciality)
    private specialityRepository: Repository<Speciality>
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async onModuleInit() {
    await this.initializeSpecialities();
  }

  private async initializeSpecialities() {
    const count = await this.specialityRepository.count();

    if (count === 0) {
      const specialities = [
        { speciality: 'Graphic Designer' },
        { speciality: 'Content Creator' },
        { speciality: 'Account Executive' },
        { speciality: 'Photographer' },
        { speciality: 'Videographer' },
        { speciality: 'Video Editor' },
        { speciality: 'Copywriter' },
        { speciality: 'Web Developer' }
      ];

      await this.specialityRepository.save(specialities);
      console.log('✅ Specialities initialized successfully');
    }
  }
}
