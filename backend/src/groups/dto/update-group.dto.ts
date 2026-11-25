import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsIn(['public', 'private'])
  @IsOptional()
  privacy?: string;
}