import { users, type User, type InsertUser, messages, type Message, type InsertMessage } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message related methods
  getMessages(): Promise<Message[]>;
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messagesMap: Map<number, Message>;
  private userCurrentId: number;
  private messageCurrentId: number;

  constructor() {
    this.users = new Map();
    this.messagesMap = new Map();
    this.userCurrentId = 1;
    this.messageCurrentId = 1;
    
    // Add some sample messages
    this.createMessage({
      name: "Kivan",
      message: "Happy birthday Aqsa! Wishing you a day filled with joy and laughter. You deserve all the happiness in my world!",
    });
    
    this.createMessage({
      name: "Ahmed",
      message: "May your day be as special as you are. Many happy returns!",
    });
    
    this.createMessage({
      name: "Fatima",
      message: "To many more years of friendship and celebrations. Happy birthday!",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Message methods
  async getMessages(): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesMap.get(id);
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const timestamp = new Date();
    const message: Message = { ...insertMessage, id, timestamp };
    this.messagesMap.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
