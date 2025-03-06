import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Role } from 'src/common/entities/user.entity';

@Injectable()
export class ParseRoleArrayPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            return [];
        }

        const roles = value.split(',').map((role: string) => {
            if (!(role in Role)) {
                throw new BadRequestException(`Invalid role: ${role}`);
            }
            return role as Role;
        });

        return roles;
    }
}