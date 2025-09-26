import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, DefaultValuePipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateUserCommand } from '../../shared/commands/user/create-user.command';
import { UpdateUserCommand } from '../../shared/commands/user/update-user.command';
import { GetUserQuery } from '../../shared/queries/user/get-user.query';
import { GetUsersQuery } from '../../shared/queries/user/get-users.query';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully created', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User with this email already exists' })
  @ApiBody({ type: CreateUserDto })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserCommand(
        createUserDto.email,
        createUserDto.firstName,
        createUserDto.lastName,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully updated', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.commandBus.execute(
      new UpdateUserCommand(userId, updateUserDto),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User found', type: UserResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUser(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetUserQuery(userId));
  }

  @Get()
  @ApiOperation({ summary: 'Get list of users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering users' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of users', type: [UserResponseDto] })
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<UserResponseDto[]> {
    return this.queryBus.execute(new GetUsersQuery(page, limit, search));
  }
}