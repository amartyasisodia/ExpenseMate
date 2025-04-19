import { 
  users, type User, type InsertUser,
  accounts, type Account, type InsertAccount,
  categories, type Category, type InsertCategory,
  transactions, type Transaction, type InsertTransaction,
  budgets, type Budget, type InsertBudget
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { IStorage, TransactionFilters, FinancialSummary, CategoryExpense, MonthlyOverview, WeeklySpending } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Account operations
  async getAccounts(userId: number): Promise<Account[]> {
    return db.select().from(accounts).where(eq(accounts.userId, userId));
  }

  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account || undefined;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const [newAccount] = await db
      .insert(accounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updatedAccount] = await db
      .update(accounts)
      .set(account)
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async deleteAccount(id: number): Promise<boolean> {
    const result = await db
      .delete(accounts)
      .where(eq(accounts.id, id))
      .returning({ id: accounts.id });
    return result.length > 0;
  }
  
  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    return result.length > 0;
  }
  
  // Transaction operations
  async getTransactions(userId: number, filters?: TransactionFilters): Promise<Transaction[]> {
    // Build conditions array
    const conditions = [eq(transactions.userId, userId)];
    
    if (filters) {
      if (filters.startDate) {
        conditions.push(gte(transactions.date, filters.startDate));
      }
      if (filters.endDate) {
        conditions.push(lte(transactions.date, filters.endDate));
      }
      if (filters.categoryId) {
        conditions.push(eq(transactions.categoryId, filters.categoryId));
      }
      if (filters.accountId) {
        conditions.push(eq(transactions.accountId, filters.accountId));
      }
      if (filters.type) {
        conditions.push(eq(transactions.type, filters.type));
      }
    }
    
    // Use and() to combine all conditions
    let query = db.select().from(transactions).where(and(...conditions));
    
    return query.orderBy(desc(transactions.date));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(transaction)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction || undefined;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db
      .delete(transactions)
      .where(eq(transactions.id, id))
      .returning({ id: transactions.id });
    return result.length > 0;
  }
  
  // Budget operations
  async getBudgets(userId: number, month?: number, year?: number): Promise<Budget[]> {
    // Build conditions
    const conditions = [eq(budgets.userId, userId)];
    
    if (month !== undefined && year !== undefined) {
      conditions.push(eq(budgets.month, month));
      conditions.push(eq(budgets.year, year));
    }
    
    return db.select().from(budgets).where(and(...conditions));
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget || undefined;
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const [newBudget] = await db
      .insert(budgets)
      .values(budget)
      .returning();
    return newBudget;
  }

  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const [updatedBudget] = await db
      .update(budgets)
      .set(budget)
      .where(eq(budgets.id, id))
      .returning();
    return updatedBudget || undefined;
  }

  async deleteBudget(id: number): Promise<boolean> {
    const result = await db
      .delete(budgets)
      .where(eq(budgets.id, id))
      .returning({ id: budgets.id });
    return result.length > 0;
  }
  
  // Financial summary
  async getFinancialSummary(userId: number, month?: number, year?: number): Promise<FinancialSummary> {
    // Build base conditions for income
    const incomeConditions = [
      eq(transactions.userId, userId),
      eq(transactions.type, 'income')
    ];
    
    // Build base conditions for expenses
    const expenseConditions = [
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense')
    ];
    
    // Add date range conditions if month and year are provided
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month
      
      incomeConditions.push(gte(transactions.date, startDate));
      incomeConditions.push(lte(transactions.date, endDate));
      
      expenseConditions.push(gte(transactions.date, startDate));
      expenseConditions.push(lte(transactions.date, endDate));
    }
    
    // Execute income query
    const [incomeResult] = await db.select({ 
      total: sql<number>`sum(${transactions.amount})` 
    })
    .from(transactions)
    .where(and(...incomeConditions));
    
    // Execute expense query
    const [expenseResult] = await db.select({
      total: sql<number>`sum(${transactions.amount})`
    })
    .from(transactions)
    .where(and(...expenseConditions));
    
    const totalIncome = incomeResult?.total || 0;
    const totalExpenses = expenseResult?.total || 0;
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      lastUpdated: new Date()
    };
  }

  async getExpensesByCategory(userId: number, month?: number, year?: number): Promise<CategoryExpense[]> {
    // Base conditions
    const conditions = [
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense')
    ];
    
    // Add date range conditions if month and year are provided
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of month
      
      conditions.push(gte(transactions.date, startDate));
      conditions.push(lte(transactions.date, endDate));
    }
    
    // Execute query with all conditions
    const results = await db.select({
      categoryId: transactions.categoryId,
      amount: sql<number>`sum(${transactions.amount})`
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(transactions.categoryId);
    
    // Join with category names
    const categoryExpenses: CategoryExpense[] = [];
    
    for (const result of results) {
      if (result.categoryId) {
        const [category] = await db
          .select()
          .from(categories)
          .where(eq(categories.id, result.categoryId));
        
        if (category) {
          categoryExpenses.push({
            categoryId: result.categoryId,
            categoryName: category.name,
            amount: result.amount
          });
        }
      }
    }
    
    return categoryExpenses;
  }

  async getMonthlyOverview(userId: number, month: number, year: number): Promise<MonthlyOverview> {
    // Get monthly budget total
    const [budgetTotal] = await db.select({
      total: sql<number>`sum(${budgets.amount})`
    })
    .from(budgets)
    .where(and(
      eq(budgets.userId, userId),
      eq(budgets.month, month),
      eq(budgets.year, year)
    ));
    
    // Get total expenses for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    
    const [expenseTotal] = await db.select({
      total: sql<number>`sum(${transactions.amount})`
    })
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.type, 'expense'),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    ));
    
    // Calculate weekly spending
    const weeklySpending: WeeklySpending[] = [];
    
    // Get the number of weeks in the month
    const daysInMonth = endDate.getDate();
    const weeksInMonth = Math.ceil(daysInMonth / 7);
    
    for (let i = 0; i < weeksInMonth; i++) {
      const weekStartDate = new Date(year, month - 1, i * 7 + 1);
      const weekEndDate = new Date(year, month - 1, Math.min((i + 1) * 7, daysInMonth));
      
      const [weekExpense] = await db.select({
        total: sql<number>`sum(${transactions.amount})`
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'expense'),
        gte(transactions.date, weekStartDate),
        lte(transactions.date, weekEndDate)
      ));
      
      weeklySpending.push({
        startDate: weekStartDate,
        endDate: weekEndDate,
        amount: weekExpense?.total || 0
      });
    }
    
    return {
      budget: budgetTotal?.total || 0,
      spent: expenseTotal?.total || 0,
      weeklySpending
    };
  }

  // Initialize default data
  async initializeDefaultData(userId: number): Promise<void> {
    // Default categories
    const defaultCategories = [
      { name: 'Food', userId, isDefault: true },
      { name: 'Transportation', userId, isDefault: true },
      { name: 'Housing', userId, isDefault: true },
      { name: 'Entertainment', userId, isDefault: true },
      { name: 'Healthcare', userId, isDefault: true },
      { name: 'Shopping', userId, isDefault: true },
      { name: 'Utilities', userId, isDefault: true },
      { name: 'Education', userId, isDefault: true },
      { name: 'Savings', userId, isDefault: true },
      { name: 'Other', userId, isDefault: true }
    ];
    
    // Default accounts
    const defaultAccounts = [
      { name: 'Cash', userId },
      { name: 'Bank Account', userId },
      { name: 'Credit Card', userId }
    ];
    
    // Insert default categories
    await db.insert(categories).values(defaultCategories);
    
    // Insert default accounts
    await db.insert(accounts).values(defaultAccounts);
  }
}