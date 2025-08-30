import { type User, type InsertUser, type MealAnalysis, type InsertMealAnalysis } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createMealAnalysis(analysis: InsertMealAnalysis): Promise<MealAnalysis>;
  getMealAnalysis(id: string): Promise<MealAnalysis | undefined>;
  updateMealAnalysisFeedback(id: string, feedback: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private mealAnalyses: Map<string, MealAnalysis>;

  constructor() {
    this.users = new Map();
    this.mealAnalyses = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMealAnalysis(insertAnalysis: InsertMealAnalysis): Promise<MealAnalysis> {
    const id = randomUUID();
    const analysis: MealAnalysis = { 
      id,
      imageUrl: insertAnalysis.imageUrl,
      nutrition: {
        calories: insertAnalysis.nutrition.calories,
        protein: insertAnalysis.nutrition.protein,
        carbs: insertAnalysis.nutrition.carbs,
        fat: insertAnalysis.nutrition.fat,
        confidence: insertAnalysis.nutrition.confidence,
        foodItems: Array.isArray(insertAnalysis.nutrition.foodItems) 
          ? insertAnalysis.nutrition.foodItems as string[]
          : []
      },
      feedback: insertAnalysis.feedback || null,
      createdAt: new Date()
    };
    this.mealAnalyses.set(id, analysis);
    return analysis;
  }

  async getMealAnalysis(id: string): Promise<MealAnalysis | undefined> {
    return this.mealAnalyses.get(id);
  }

  async updateMealAnalysisFeedback(id: string, feedback: number): Promise<void> {
    const analysis = this.mealAnalyses.get(id);
    if (analysis) {
      analysis.feedback = feedback;
      this.mealAnalyses.set(id, analysis);
    }
  }
}

export const storage = new MemStorage();
