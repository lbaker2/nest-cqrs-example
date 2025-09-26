import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetGroupQuery } from '../../../../shared/queries/group/get-group.query';
import { GroupResponseDto } from '../../dtos/group-response.dto';
import { Group } from '../../schemas/group.schema';

@QueryHandler(GetGroupQuery)
export class GetGroupHandler implements IQueryHandler<GetGroupQuery> {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
  ) {}

  async execute(query: GetGroupQuery): Promise<GroupResponseDto | null> {
    const { groupId } = query;

    const group = await this.groupModel
      .findById(groupId)
      .populate('memberIds')
      .populate('adminId')
      .lean()
      .exec();
    
    if (!group) return null;

    const members = group.memberIds.map((member: any) => ({
      userId: member._id.toString(),
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      fullName: `${member.firstName} ${member.lastName}`,
    }));

    const admin = group.adminId ? {
      userId: (group.adminId as any)._id.toString(),
      email: (group.adminId as any).email,
      firstName: (group.adminId as any).firstName,
      lastName: (group.adminId as any).lastName,
      fullName: `${(group.adminId as any).firstName} ${(group.adminId as any).lastName}`,
    } : undefined;

    return {
      id: group._id.toString(),
      name: group.name,
      description: group.description,
      members,
      admin,
      isActive: group.isActive,
      maxMembers: group.maxMembers,
      memberCount: members.length,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    };
  }
}