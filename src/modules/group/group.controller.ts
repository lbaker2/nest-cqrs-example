import { Controller, Get, Post, Put, Delete, Body, Param, Query, DefaultValuePipe, ParseIntPipe, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateGroupCommand } from '../../shared/commands/group/create-group.command';
import { UpdateGroupCommand } from '../../shared/commands/group/update-group.command';
import { AddMemberCommand } from '../../shared/commands/group/add-member.command';
import { RemoveMemberCommand } from '../../shared/commands/group/remove-member.command';
import { GetGroupQuery } from '../../shared/queries/group/get-group.query';
import { GetGroupsQuery } from '../../shared/queries/group/get-groups.query';
import { GetUserGroupsQuery } from '../../shared/queries/group/get-user-groups.query';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { AddMemberDto } from './dtos/add-member.dto';
import { GroupResponseDto } from './dtos/group-response.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Group successfully created', type: GroupResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiBody({ type: CreateGroupDto })
  async createGroup(@Body() createGroupDto: CreateGroupDto) {
    return this.commandBus.execute(
      new CreateGroupCommand(
        createGroupDto.name,
        createGroupDto.description,
        createGroupDto.adminId,
        createGroupDto.maxMembers,
      ),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Group successfully updated', type: GroupResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Group not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiBody({ type: UpdateGroupDto })
  async updateGroup(
    @Param('id') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.commandBus.execute(
      new UpdateGroupCommand(groupId, updateGroupDto),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Group found', type: GroupResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Group not found' })
  async getGroup(@Param('id') groupId: string): Promise<GroupResponseDto> {
    return this.queryBus.execute(new GetGroupQuery(groupId));
  }

  @Get()
  @ApiOperation({ summary: 'Get list of groups' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for filtering groups' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of groups', type: [GroupResponseDto] })
  async getGroups(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<GroupResponseDto[]> {
    return this.queryBus.execute(new GetGroupsQuery(page, limit, search));
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Member successfully added to group', type: GroupResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Group or user not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Member already in group or group is full' })
  @ApiBody({ type: AddMemberDto })
  async addMember(
    @Param('id') groupId: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.commandBus.execute(
      new AddMemberCommand(groupId, addMemberDto.userId),
    );
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from a group' })
  @ApiParam({ name: 'id', description: 'Group ID' })
  @ApiParam({ name: 'userId', description: 'User ID to remove from group' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Member successfully removed from group', type: GroupResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Group or member not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Member not in group' })
  async removeMember(
    @Param('id') groupId: string,
    @Param('userId') userId: string,
  ) {
    return this.commandBus.execute(
      new RemoveMemberCommand(groupId, userId),
    );
  }

  @Get('users/:userId/groups')
  @ApiOperation({ summary: 'Get all groups for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of user groups', type: [GroupResponseDto] })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async getUserGroups(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<GroupResponseDto[]> {
    return this.queryBus.execute(new GetUserGroupsQuery(userId, page, limit));
  }
}