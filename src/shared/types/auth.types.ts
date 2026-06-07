import { Role } from 'generated/prisma/enums';

export interface JwtPayload {
  userId: string;
  login: string;
  role: Role;
}
