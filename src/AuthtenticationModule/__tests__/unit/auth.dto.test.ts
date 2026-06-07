import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { AuthDto } from 'src/AuthtenticationModule/authtentication.dto';

describe('authDto', () => {
  it('should pass with valid data', async () => {
    const dto = new AuthDto();
    dto.login = 'user';
    dto.password = '123456';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail when login is missing', async () => {
    const dto = new AuthDto();
    dto.password = '123456';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when password is missing', async () => {
    const dto = new AuthDto();
    dto.login = 'user';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when login is not string', async () => {
    const dto = new AuthDto();
    dto.login = 123 as any;
    dto.password = '123';

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
