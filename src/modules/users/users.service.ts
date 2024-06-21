import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { isUUID } from 'class-validator';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UserService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Creates a new user in the database.
   * @param createUserDto - Data transfer object containing user details.
   * @returns The created user.
   * @throws InternalServerErrorException if there's an error during the creation process.
   */
  async create(createUserDto: CreateUserDto) {
    try {
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });

      const user = this.usersRepository.create({
        ...createUserDto,
        roles: [defaultRole],
      });

      return await this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);
      if (error.code === '23505') throw new BadRequestException(error.message);
      throw new BadRequestException(
        `Error creating user: ${createUserDto.email}`,
      );
    }
  }

  /**
   * Retrieves a list of users from the database with pagination.
   * @param paginationDto - Data transfer object containing pagination details.
   * @returns A list of users.
   * @throws InternalServerErrorException if there's an error during the retrieval process.
   */
  async findAll(paginationDto: PaginationDto): Promise<User[]> {
    try {
      const { limit = 0, offset = 0 } = paginationDto;
      return await this.usersRepository.find({
        where: { active: true },
        relations: { roles: true },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.logger.error(`Error finding user collection: ${error.message}`);
      throw new InternalServerErrorException(`Cannot find products`);
    }
  }

  /**
   * Retrieves a single user by its UUID
   * @param payload The search `id` or `Email`, which can be a UUID or a String
   * @param allowPrivate shows the hidden columns from the entity
   * @returns The found user.
   * @throws NotFoundException if there's an error during the retrieval process.
   * @warning TEST WATCH OUT!
   */
  async findOneByIdOrEmail(
    payload: string,
    allowPrivate: boolean = false,
  ): Promise<User> {
    try {
      const where = isUUID(payload) ? { id: payload } : { email: payload };
      const select = !allowPrivate
        ? {}
        : {
            id: true,
            email: true,
            password: true,
            firstName: true,
            lastName: true,
            phone: true,
          };

      return await this.usersRepository.findOne({
        relations: { roles: true },
        where,
        select,
      });
    } catch (error) {
      this.logger.error(
        `Error finding user with ${payload} - ${error.message}`,
      );
      throw new NotFoundException(`Error searching user: ${payload}`);
    }
  }

  /**
   * Updates an existing user in the database.
   * @param id - The UUID of the user to update.
   * @param updateUserDto - Data transfer object containing updated user details.
   * @returns The updated user.
   * @throws NotFoundException if the user is not found.
   * @throws InternalServerErrorException if there's an error during the update process.
   * @warning TEST WATCH OUT!
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) throw new NotFoundException(`User with id: ${id} not found`);
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      this.logger.error(`Error deleting user ${id}: ${error.message}`);
      throw new InternalServerErrorException(
        `Error updating user with id: ${id}`,
      );
    }
  }

  /**
   * Removes a user from the database.
   * @param id - The UUID of the user to remove.
   * @returns The removed user.
   * @throws InternalServerErrorException if there's an error during the removal process.
   * @warning TEST WATCH OUT!
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOneByIdOrEmail(id);
    try {
      await this.usersRepository.remove(user);
    } catch (error) {
      this.logger.error(`Error deleting user ${id}: ${error.message}`);
      throw new InternalServerErrorException(
        `Error deleting user with id: ${id}`,
      );
    }
  }
}
