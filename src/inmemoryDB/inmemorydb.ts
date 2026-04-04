import { Injectable } from '@nestjs/common';
import type { User } from './types';

@Injectable()
export class InMemoryDb {
  users: User[] = [];
}
