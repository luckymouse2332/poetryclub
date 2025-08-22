import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  async transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = await this.schema.safeParseAsync(value);

    if (!result.success) {
      throw new BadRequestException(result.error);
    }

    return result.data;
  }
}
