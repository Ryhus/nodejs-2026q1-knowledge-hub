import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import {
  CreateUserDto,
  UpdatePasswordDto,
  GetUsersQueryDto,
} from 'src/UserModule/user.dto';
import { plainToInstance } from 'class-transformer';
import { Role } from 'generated/prisma/enums';

describe('CreateUserDto', () => {
  it('should pass with valid data', async () => {
    const dto = new CreateUserDto();
    dto.login = 'test';
    dto.password = '123';
    dto.role = Role.admin;

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when login is missing', async () => {
    const dto = new CreateUserDto();
    dto.password = '123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when password is not string', async () => {
    const dto = new CreateUserDto();
    dto.login = 'test';
    dto.password = 123 as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when role is invalid', async () => {
    const dto = new CreateUserDto();
    dto.login = 'test';
    dto.password = '123';
    dto.role = 'invalid' as any;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdatePasswordDto', () => {
  it('should pass with valid data', async () => {
    const dto = new UpdatePasswordDto();

    dto.oldPassword = 'old';
    dto.newPassword = 'new';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail if fields are missing', async () => {
    const dto = new UpdatePasswordDto();
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('GetUsersQueryDto', () => {
  it('should pass with valid query', async () => {
    const dto = plainToInstance(GetUsersQueryDto, {
      sortBy: 'login',
      order: 'asc',
      page: '1',
      limit: '5',
    });

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail with invalid sortBy', async () => {
    const dto = plainToInstance(GetUsersQueryDto, {
      sortBy: 'invalid',
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when page < 1', async () => {
    const dto = plainToInstance(GetUsersQueryDto, {
      page: 0,
    });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should transform page and limit to numbers', async () => {
    const dto = plainToInstance(GetUsersQueryDto, {
      page: '2',
      limit: '10',
    });

    expect(typeof dto.page).toBe('number');
    expect(typeof dto.limit).toBe('number');
  });
});
