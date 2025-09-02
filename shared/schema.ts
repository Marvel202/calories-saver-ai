import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const mealAnalyses = pgTable("meal_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  nutrition: json("nutrition").$type<{
    status: string;
    food: Array<{
      name: string;
      quantity: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
    total: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
  }>().notNull(),
  feedback: integer("feedback"), // 1-4 rating
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMealAnalysisSchema = createInsertSchema(mealAnalyses).pick({
  imageUrl: true,
  nutrition: true,
  feedback: true,
});

export const nutritionDataSchema = z.object({
  status: z.string(),
  food: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  })),
  total: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type MealAnalysis = typeof mealAnalyses.$inferSelect;
export type InsertMealAnalysis = z.infer<typeof insertMealAnalysisSchema>;
export type NutritionData = z.infer<typeof nutritionDataSchema>;
