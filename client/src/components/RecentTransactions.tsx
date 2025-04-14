import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { Link } from "wouter";
import { ShoppingCart, Zap, FileText, CreditCard, PieChart, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: number;
  date: string | Date;
  type: string;
  amount: number;
  description?: string;
  categoryId?: number;
  accountId: number;
  toAccountId?: number;
  invoiceName?: string;
}

interface RecentTransactionsProps {
  isLoading: boolean;
  transactions: Transaction[];
}

export default function RecentTransactions({ isLoading, transactions }: RecentTransactionsProps) {
  // Helper function to get icon based on transaction type or category
  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'income':
        return <DollarSign className="h-5 w-5 text-primary" />;
      case 'transfer':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'expense':
        // You could further refine this based on categoryId
        switch(transaction.description?.toLowerCase()) {
          case 'grocery shopping':
            return <ShoppingCart className="h-5 w-5 text-secondary" />;
          case 'electricity bill':
            return <Zap className="h-5 w-5 text-secondary" />;
          default:
            return <PieChart className="h-5 w-5 text-secondary" />;
        }
      default:
        return <PieChart className="h-5 w-5 text-secondary" />;
    }
  };

  // Format amount with proper sign and color
  const renderAmount = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return <p className="font-medium text-primary">+{formatCurrency(transaction.amount)}</p>;
    } else if (transaction.type === 'expense') {
      return <p className="font-medium text-secondary">-{formatCurrency(transaction.amount)}</p>;
    } else if (transaction.type === 'transfer') {
      return <p className="font-medium text-blue-600">{formatCurrency(transaction.amount)}</p>;
    }
  };

  // Format date and time for display
  const formatDateTime = (date: Date | string) => {
    const dateObj = new Date(date);
    
    // Check if it's today
    const today = new Date();
    if (dateObj.toDateString() === today.toDateString()) {
      return `Today, ${format(dateObj, 'h:mm a')}`;
    }
    
    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateObj.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(dateObj, 'h:mm a')}`;
    }
    
    // Regular date format
    return format(dateObj, 'MMM d, h:mm a');
  };

  // Get category text (this would come from the categories in a full implementation)
  const getCategoryText = (transaction: Transaction) => {
    // In a real app, you would look up the category name based on categoryId
    // This is mocked for now
    return transaction.type === 'income' ? 'Income' : transaction.type === 'transfer' ? 'Transfer' : 'Expense';
  };

  return (
    <Card className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
        <Link to="/transactions">
          <a className="text-sm text-accent hover:text-blue-700">View All</a>
        </Link>
      </div>
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          // Loading skeletons
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))
        ) : transactions.length > 0 ? (
          // Actual transactions
          transactions.map(transaction => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`${
                    transaction.type === 'income' ? 'bg-green-100' : 
                    transaction.type === 'transfer' ? 'bg-blue-100' : 'bg-red-100'
                  } rounded-full p-2 mr-3`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{transaction.description || 'Unnamed Transaction'}</p>
                    <p className="text-sm text-gray-500">{getCategoryText(transaction)}</p>
                    {transaction.invoiceName && (
                      <div className="flex items-center mt-1">
                        <FileText className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">Invoice: {transaction.invoiceName}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {renderAmount(transaction)}
                  <p className="text-xs text-gray-500">{formatDateTime(transaction.date)}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No transactions state
          <div className="p-8 text-center text-gray-500">
            <p>No transactions to display.</p>
            <p className="text-sm mt-1">Add your first transaction to get started.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
