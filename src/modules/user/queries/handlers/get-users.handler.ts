import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GetUsersQuery } from '../../../../shared/queries/user/get-users.query';
import { UserResponseDto } from '../../dtos/user-response.dto';
import { User } from '../../schemas/user.schema';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async execute(query: GetUsersQuery): Promise<UserResponseDto[]> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    let mongoQuery = {};
    if (search) {
      mongoQuery = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const users = await this.userModel
      .find(mongoQuery)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    return users.map(user => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}