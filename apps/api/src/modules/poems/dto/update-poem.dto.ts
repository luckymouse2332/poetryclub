import { PartialType } from '@nestjs/swagger';
import { CreatePoemDto } from './create-poem.dto';

export class UpdatePoemDto extends PartialType(CreatePoemDto) {}
