import { 
  User, InsertUser, 
  Transaction, InsertTransaction, 
  Account, InsertAccount, 
  Category, InsertCategory, 
  Budget, InsertBudget
} from "@shared/schema";

// CRUD interface for the storage
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Account operations
  getAccounts(userId: number): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(userId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Transaction operations
  getTransactions(userId: number, filters?: TransactionFilters): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Budget operations
  getBudgets(userId: number, month?: number, year?: number): Promise<Budget[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined>;
  deleteBudget(id: number): Promise<boolean>;
  
  // Financial summary
  getFinancialSummary(userId: number, month?: number, year?: number): Promise<FinancialSummary>;
  getExpensesByCategory(userId: number, month?: number, year?: number): Promise<CategoryExpense[]>;
  getMonthlyOverview(userId: number, month: number, year: number): Promise<MonthlyOverview>;
}

// Types for financial data retrieval
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  accountId?: number;
  type?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  lastUpdated: Date;
}

export interface CategoryExpense {
  categoryId: number;
  categoryName: string;
  amount: number;
}

export interface MonthlyOverview {
  budget: number;
  spent: number;
  weeklySpending: WeeklySpending[];
}

export interface WeeklySpending {
  startDate: Date;
  endDate: Date;
  amount: number;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private accounts: Map<number, Account>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  
  private userCurrentId: number;
  private accountCurrentId: number;
  private categoryCurrentId: number;
  private transactionCurrentId: number;
  private budgetCurrentId: number;

  constructor() {
    this.users = new Map();
    this.accounts = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    
    this.userCurrentId = 1;
    this.accountCurrentId = 1;
    this.categoryCurrentId = 1;
    this.transactionCurrentId = 1;
    this.budgetCurrentId = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
    // Initialize with default accounts
    this.initializeDefaultAccounts();
  }
  
  private initializeDefaultCategories() {
    const defaultCategories = [
      'Food', 'Household', 'Rent', 'Electricity', 'LPG Bill', 
      'Mobile Recharge', 'Apparel', 'Education', 'Health', 
      'Beauty', 'Transportation', 'Social Life', 'Self-development', 
      'Entertainment'
    ];
    
    for (const name of defaultCategories) {
      this.categories.set(this.categoryCurrentId, {
        id: this.categoryCurrentId,
        name,
        userId: 0, // System default
        isDefault: true
      });
      this.categoryCurrentId++;
    }
  }
  
  private initializeDefaultAccounts() {
    const defaultAccounts = ['Cash', 'Card', 'Bank'];
    
    for (const name of defaultAccounts) {
      this.accounts.set(this.accountCurrentId, {
        id: this.accountCurrentId,
        name,
        userId: 0 // System default
      });
      this.accountCurrentId++;
    }
  }

  // User operations
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
  
  // Account operations
  async getAccounts(userId: number): Promise<Account[]> {
    return Array.from(this.accounts.values())
      .filter(account => account.userId === userId || account.userId === 0);
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accounts.get(id);
  }
  
  async createAccount(account: InsertAccount): Promise<Account> {
    const id = this.accountCurrentId++;
    const newAccount: Account = { ...account, id };
    this.accounts.set(id, newAccount);
    return newAccount;
  }
  
  async updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined> {
    const existingAccount = this.accounts.get(id);
    if (!existingAccount) return undefined;
    
    const updatedAccount = { ...existingAccount, ...account };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteAccount(id: number): Promise<boolean> {
    return this.accounts.delete(id);
  }
  
  // Category operations
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values())
      .filter(category => category.userId === userId || category.userId === 0);
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Transaction operations
  async getTransactions(userId: number, filters?: TransactionFilters): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId);
    
    if (filters) {
      if (filters.startDate) {
        transactions = transactions.filter(t => t.date >= filters.startDate!);
      }
      
      if (filters.endDate) {
        transactions = transactions.filter(t => t.date <= filters.endDate!);
      }
      
      if (filters.categoryId) {
        transactions = transactions.filter(t => t.categoryId === filters.categoryId);
      }
      
      if (filters.accountId) {
        transactions = transactions.filter(t => 
          t.accountId === filters.accountId || 
          (t.type === 'transfer' && t.toAccountId === filters.accountId)
        );
      }
      
      if (filters.type) {
        transactions = transactions.filter(t => t.type === filters.type);
      }
    }
    
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }
  
  async updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) return undefined;
    
    const updatedTransaction = { ...existingTransaction, ...transaction };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  
  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }
  
  // Budget operations
  async getBudgets(userId: number, month?: number, year?: number): Promise<Budget[]> {
    let budgets = Array.from(this.budgets.values())
      .filter(budget => budget.userId === userId);
    
    if (month !== undefined) {
      budgets = budgets.filter(b => b.month === month);
    }
    
    if (year !== undefined) {
      budgets = budgets.filter(b => b.year === year);
    }
    
    return budgets;
  }
  
  async getBudget(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }
  
  async createBudget(budget: InsertBudget): Promise<Budget> {
    const id = this.budgetCurrentId++;
    const newBudget: Budget = { ...budget, id };
    this.budgets.set(id, newBudget);
    return newBudget;
  }
  
  async updateBudget(id: number, budget: Partial<InsertBudget>): Promise<Budget | undefined> {
    const existingBudget = this.budgets.get(id);
    if (!existingBudget) return undefined;
    
    const updatedBudget = { ...existingBudget, ...budget };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
  
  async deleteBudget(id: number): Promise<boolean> {
    return this.budgets.delete(id);
  }
  
  // Financial summary
  async getFinancialSummary(userId: number, month?: number, year?: number): Promise<FinancialSummary> {
    const allTransactions = await this.getTransactions(userId);
    
    let transactions = allTransactions;
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      transactions = allTransactions.filter(t => 
        t.date >= startDate && t.date <= endDate
      );
    }
    
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
      lastUpdated: new Date()
    };
  }
  
  async getExpensesByCategory(userId: number, month?: number, year?: number): Promise<CategoryExpense[]> {
    const allTransactions = await this.getTransactions(userId);
    const categories = await this.getCategories(userId);
    
    let transactions = allTransactions.filter(t => t.type === 'expense');
    
    if (month !== undefined && year !== undefined) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      transactions = transactions.filter(t => 
        t.date >= startDate && t.date <= endDate
      );
    }
    
    const categoryMap = new Map<number, CategoryExpense>();
    
    for (const transaction of transactions) {
      if (!transaction.categoryId) continue;
      
      const categoryId = transaction.categoryId;
      const category = categories.find(c => c.id === categoryId);
      
      if (!category) continue;
      
      const existing = categoryMap.get(categoryId);
      
      if (existing) {
        existing.amount += transaction.amount;
      } else {
        categoryMap.set(categoryId, {
          categoryId,
          categoryName: category.name,
          amount: transaction.amount
        });
      }
    }
    
    return Array.from(categoryMap.values());
  }
  
  async getMonthlyOverview(userId: number, month: number, year: number): Promise<MonthlyOverview> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    // Get the budget for this month
    const budgets = await this.getBudgets(userId, month, year);
    const totalBudget = budgets.find(b => !b.categoryId)?.amount || 0;
    
    // Get expenses for this month
    const transactions = await this.getTransactions(userId, {
      startDate,
      endDate,
      type: 'expense'
    });
    
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate weekly spending
    const weeks: WeeklySpending[] = [];
    const daysInMonth = endDate.getDate();
    
    for (let i = 1; i <= daysInMonth; i += 7) {
      const weekStartDate = new Date(year, month - 1, i);
      const weekEndDate = new Date(year, month - 1, Math.min(i + 6, daysInMonth));
      
      const weekExpenses = transactions.filter(t => 
        t.date >= weekStartDate && t.date <= weekEndDate
      );
      
      const weeklyAmount = weekExpenses.reduce((sum, t) => sum + t.amount, 0);
      
      weeks.push({
        startDate: weekStartDate,
        endDate: weekEndDate,
        amount: weeklyAmount
      });
    }
    
    return {
      budget: totalBudget,
      spent: totalSpent,
      weeklySpending: weeks
    };
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from './databaseStorage';

// Export storage as DatabaseStorage instance
export const storage = new DatabaseStorage();
