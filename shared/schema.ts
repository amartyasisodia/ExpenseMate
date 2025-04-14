import { pgTable, text, serial, integer, doublePrecision, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Accounts table definition
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertAccountSchema = createInsertSchema(accounts).pick({
  name: true,
  userId: true,
});

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

// Categories table definition
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  userId: true,
  isDefault: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Transactions table definition
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull(), // 'expense', 'income', 'transfer'
  amount: doublePrecision("amount").notNull(),
  description: text("description"),
  categoryId: integer("category_id"),
  accountId: integer("account_id").notNull(),
  toAccountId: integer("to_account_id"), // Only for transfers
  invoiceName: text("invoice_name"),
  userId: integer("user_id").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  date: true,
  type: true,
  amount: true,
  description: true,
  categoryId: true,
  accountId: true,
  toAccountId: true,
  invoiceName: true,
  userId: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Budget table definition
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  amount: doublePrecision("amount").notNull(),
  categoryId: integer("category_id"), // null for total budget
  userId: integer("user_id").notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  month: true,
  year: true,
  amount: true,
  categoryId: true,
  userId: true,
});

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;

// Schemas with validation
export const transactionFormSchema = insertTransactionSchema.extend({
  type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().positive(),
  date: z.date(),
  categoryId: z.number().optional(),
  accountId: z.number(),
  toAccountId: z.number().optional(),
});

export const accountSchema = insertAccountSchema.extend({
  name: z.string().min(1, "Account name is required"),
});

export const categorySchema = insertCategorySchema.extend({
  name: z.string().min(1, "Category name is required"),
});

export const budgetSchema = insertBudgetSchema.extend({
  amount: z.number().positive(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});
