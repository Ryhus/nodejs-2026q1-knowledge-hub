import { Injectable } from '@nestjs/common';
import { Message } from './types/rag-service.types';

@Injectable()
export class RagConversationStore {
  private conversations = new Map<string, Message[]>();

  getLastMessages(id: string, limit = 20) {
    return (this.conversations.get(id) ?? []).slice(-limit);
  }

  addMessage(conversationId: string, message: Message) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, []);
    }

    this.conversations.get(conversationId).push(message);
  }
}
