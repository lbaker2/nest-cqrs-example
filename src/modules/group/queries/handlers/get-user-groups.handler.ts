import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetUserGroupsQuery } from '../../../../shared/queries/group/get-user-groups.query';
import { GroupResponseDto } from '../../dtos/group-response.dto';
import { Group } from '../../schemas/group.schema';

@QueryHandler(GetUserGroupsQuery)
export class GetUserGroupsHandler implements IQueryHandler<GetUserGroupsQuery> {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<Group>,
  ) {}

  async execute(query: GetUserGroupsQuery): Promise<GroupResponseDto[]> {
    const { userId, page, limit } = query;
    const skip = (page - 1) * limit;

    const groups = await this.groupModel
      .find({ memberIds: userId })
      .populate('memberIds')
      .populate('adminId')
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return groups.map(group => {
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
    });
  }
}