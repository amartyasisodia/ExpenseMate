import { db } from './db';
import { users, accounts, categories, transactions, budgets } from '@shared/schema';

// Function to initialize the database schema
async function initDbSchema() {
  console.log('Initializing database schema...');
  
  try {
    // Check if schema exists
    console.log('Creating schema if not exists...');
    
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "user_id" INTEGER NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "user_id" INTEGER NOT NULL,
        "is_default" BOOLEAN DEFAULT false
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" SERIAL PRIMARY KEY,
        "date" TIMESTAMP NOT NULL DEFAULT NOW(),
        "type" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT,
        "category_id" INTEGER,
        "account_id" INTEGER NOT NULL,
        "to_account_id" INTEGER,
        "invoice_name" TEXT,
        "user_id" INTEGER NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS "budgets" (
        "id" SERIAL PRIMARY KEY,
        "month" INTEGER NOT NULL,
        "year" INTEGER NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "category_id" INTEGER,
        "user_id" INTEGER NOT NULL
      );
    `);
    
    console.log('Database schema created successfully.');
    
    // Check if there's a default user, if not create one
    const defaultUsers = await db.select().from(users).limit(1);
    
    if (defaultUsers.length === 0) {
      console.log('Creating default user...');
      
      // Create a default user
      const [defaultUser] = await db.insert(users).values({
        username: 'demo',
        password: 'demo123' // In a real app, this would be hashed
      }).returning();
      
      console.log('Default user created with ID:', defaultUser.id);
      
      // Create default categories for the user
      console.log('Creating default categories...');
      await db.insert(categories).values([
        { name: 'Food', userId: defaultUser.id, isDefault: true },
        { name: 'Transportation', userId: defaultUser.id, isDefault: true },
        { name: 'Housing', userId: defaultUser.id, isDefault: true },
        { name: 'Entertainment', userId: defaultUser.id, isDefault: true },
        { name: 'Healthcare', userId: defaultUser.id, isDefault: true },
        { name: 'Shopping', userId: defaultUser.id, isDefault: true },
        { name: 'Utilities', userId: defaultUser.id, isDefault: true },
        { name: 'Education', userId: defaultUser.id, isDefault: true },
        { name: 'Savings', userId: defaultUser.id, isDefault: true },
        { name: 'Other', userId: defaultUser.id, isDefault: true }
      ]);
      
      // Create default accounts for the user
      console.log('Creating default accounts...');
      const [cashAccount] = await db.insert(accounts).values({ 
        name: 'Cash', 
        userId: defaultUser.id 
      }).returning();
      
      const [bankAccount] = await db.insert(accounts).values({ 
        name: 'Bank Account', 
        userId: defaultUser.id 
      }).returning();
      
      const [creditCard] = await db.insert(accounts).values({ 
        name: 'Credit Card', 
        userId: defaultUser.id 
      }).returning();
      
      // Create some sample transactions
      console.log('Creating sample transactions...');
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const twoWeeksAgo = new Date(now);
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const threeWeeksAgo = new Date(now);
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      
      // Get category IDs
      const categoryList = await db.select().from(categories).where(eq => eq.userId === defaultUser.id);
      const foodCategory = categoryList.find(c => c.name === 'Food')?.id;
      const transportCategory = categoryList.find(c => c.name === 'Transportation')?.id;
      const entertainmentCategory = categoryList.find(c => c.name === 'Entertainment')?.id;
      const utilityCategory = categoryList.find(c => c.name === 'Utilities')?.id;
      
      // Sample transactions
      await db.insert(transactions).values([
        { 
          date: now, 
          type: 'expense', 
          amount: 45.50, 
          description: 'Grocery shopping', 
          categoryId: foodCategory, 
          accountId: cashAccount.id, 
          userId: defaultUser.id 
        },
        { 
          date: oneWeekAgo, 
          type: 'expense', 
          amount: 35.20, 
          description: 'Gas', 
          categoryId: transportCategory, 
          accountId: creditCard.id, 
          userId: defaultUser.id 
        },
        { 
          date: oneWeekAgo, 
          type: 'expense', 
          amount: 85.00, 
          description: 'Dinner with friends', 
          categoryId: foodCategory, 
          accountId: creditCard.id, 
          userId: defaultUser.id 
        },
        { 
          date: twoWeeksAgo, 
          type: 'expense', 
          amount: 120.75, 
          description: 'Electricity bill', 
          categoryId: utilityCategory, 
          accountId: bankAccount.id, 
          userId: defaultUser.id,
          invoiceName: 'Electric_bill_April.pdf'
        },
        { 
          date: twoWeeksAgo, 
          type: 'income', 
          amount: 2500.00, 
          description: 'Salary', 
          accountId: bankAccount.id, 
          userId: defaultUser.id 
        },
        { 
          date: threeWeeksAgo, 
          type: 'expense', 
          amount: 65.99, 
          description: 'Movie and dinner', 
          categoryId: entertainmentCategory, 
          accountId: creditCard.id, 
          userId: defaultUser.id 
        },
        { 
          date: threeWeeksAgo, 
          type: 'transfer', 
          amount: 500.00, 
          description: 'Transfer to cash', 
          accountId: bankAccount.id, 
          toAccountId: cashAccount.id,
          userId: defaultUser.id 
        }
      ]);
      
      // Create a sample budget for the current month
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = now.getFullYear();
      
      console.log('Creating sample budget...');
      await db.insert(budgets).values([
        { 
          month: currentMonth, 
          year: currentYear, 
          amount: 300.00, 
          categoryId: foodCategory, 
          userId: defaultUser.id 
        },
        { 
          month: currentMonth, 
          year: currentYear, 
          amount: 150.00, 
          categoryId: transportCategory, 
          userId: defaultUser.id 
        },
        { 
          month: currentMonth, 
          year: currentYear, 
          amount: 200.00, 
          categoryId: entertainmentCategory, 
          userId: defaultUser.id 
        },
        { 
          month: currentMonth, 
          year: currentYear, 
          amount: 350.00, 
          categoryId: utilityCategory, 
          userId: defaultUser.id 
        }
      ]);
      
      console.log('Sample data created successfully.');
    } else {
      console.log('Default user already exists. Skipping sample data creation.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export default initDbSchema;