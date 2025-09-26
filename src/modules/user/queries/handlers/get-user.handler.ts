import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetUserQuery } from '../../../../shared/queries/user/get-user.query';
import { UserResponseDto } from '../../dtos/user-response.dto';
import { User } from '../../schemas/user.schema';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async execute(query: GetUserQuery): Promise<UserResponseDto | null> {
    const { userId } = query;

    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) return null;

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}