import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  privacy?: string;
}
