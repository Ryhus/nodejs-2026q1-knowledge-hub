import type { Request } from 'express';
import type { JwtPayload } from './auth.types';

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
