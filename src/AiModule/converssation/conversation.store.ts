import { Injectable } from '@nestjs/common';

export type Message = {
  role: 'user' | 'model';
  content: string;
};

@Injectable()
export class ConversationStore {
  private sessions = new Map<string, Message[]>();

  get(sessionId: string): Message[] {
    return this.sessions.get(sessionId) || [];
  }

  set(sessionId: string, messages: Message[]) {
    this.sessions.set(sessionId, messages);
  }

  append(sessionId: string, message: Message) {
    const messages = this.get(sessionId);

    messages.push(message);

    this.sessions.set(sessionId, messages);
  }
}
