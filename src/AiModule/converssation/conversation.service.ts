import { Injectable } from '@nestjs/common';
import { ConversationStore } from './conversation.store';
import type { Message } from './conversation.store';

@Injectable()
export class ConversationService {
  constructor(private store: ConversationStore) {}

  getContext(sessionId: string): Message[] {
    return this.store.get(sessionId);
  }

  addUserMessage(sessionId: string, content: string) {
    this.store.append(sessionId, { role: 'user', content });
  }

  addAssistantMessage(sessionId: string, content: string) {
    this.store.append(sessionId, { role: 'model', content });
  }
}
