import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function NotBeforeToday(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'notBeforeToday',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return true; // Skip validation if value is not provided
          
          const inputDate = new Date(value);
          const today = new Date();
          
          // Reset time components to midnight for date-only comparison
          inputDate.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          
          return inputDate >= today;
        },
        defaultMessage(validationArguments?: ValidationArguments): string {
          return typeof validationOptions?.message === 'string'
            ? validationOptions.message
            : 'Date must not be earlier than today';
        },
      },
    });
  };
}