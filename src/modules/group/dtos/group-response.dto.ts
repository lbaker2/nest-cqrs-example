import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MemberInfo {
  @ApiProperty({
    description: 'Member user ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Member email',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Member first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Member last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Member full name',
    example: 'John Doe',
  })
  fullName: string;
}

export class GroupResponseDto {
  @ApiProperty({
    description: 'Group unique identifier',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Group name',
    example: 'Alpha Group',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Group description',
    example: 'A collaborative group focused on achieving goals together',
  })
  description?: string;

  @ApiProperty({
    description: 'List of group members',
    type: [MemberInfo],
  })
  members: MemberInfo[];

  @ApiPropertyOptional({
    description: 'Group admin information',
    type: MemberInfo,
  })
  admin?: MemberInfo;

  @ApiProperty({
    description: 'Group active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Maximum number of members allowed',
    example: 10,
  })
  maxMembers: number;

  @ApiProperty({
    description: 'Current number of members in the group',
    example: 5,
  })
  memberCount: number;

  @ApiProperty({
    description: 'Group creation date',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Group last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}