import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Group name',
    example: 'Alpha Group',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Group description',
    example: 'A collaborative group focused on achieving goals together',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Group admin user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsOptional()
  adminId?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of members allowed in the group',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  maxMembers?: number;
}