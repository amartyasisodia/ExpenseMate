import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { 
  ShoppingCart, Zap, FileText, CreditCard, 
  PieChart, DollarSign, ArrowDown, ArrowUp, 
  ArrowLeftRight, RefreshCw, Download, SlidersHorizontal 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState } from "react";

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

interface Category {
  id: number;
  name: string;
  userId: number;
  isDefault: boolean;
}

interface Account {
  id: number;
  name: string;
  userId: number;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  isLoading: boolean;
}

export default function TransactionList({ 
  transactions, 
  categories, 
  accounts, 
  isLoading 
}: TransactionListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

  // Helper function to get transaction icon
  const getTransactionIcon = (transaction: Transaction) => {
    const type = transaction.type;
    
    if (type === 'income') {
      return (
        <div className="bg-green-100 rounded-full p-2 mr-3">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
      );
    } else if (type === 'transfer') {
      return (
        <div className="bg-blue-100 rounded-full p-2 mr-3">
          <ArrowLeftRight className="h-5 w-5 text-blue-600" />
        </div>
      );
    } else {
      // For expenses, we can use different icons based on category
      const category = categories.find(c => c.id === transaction.categoryId);
      
      let icon = <PieChart className="h-5 w-5 text-secondary" />;
      
      // Assign icons based on category name or description
      if (category) {
        switch(category.name.toLowerCase()) {
          case 'food':
            icon = <ShoppingCart className="h-5 w-5 text-secondary" />;
            break;
          case 'electricity':
          case 'lpg bill':
          case 'mobile recharge':
            icon = <Zap className="h-5 w-5 text-secondary" />;
            break;
          case 'transportation':
            icon = <ArrowDown className="h-5 w-5 text-secondary" />;
            break;
          default:
            icon = <PieChart className="h-5 w-5 text-secondary" />;
        }
      }
      
      return (
        <div className="bg-red-100 rounded-full p-2 mr-3">
          {icon}
        </div>
      );
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
    return format(dateObj, 'MMM dd, h:mm a');
  };

  // Get account name by ID
  const getAccountName = (accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    return account?.name || 'Unknown Account';
  };

  // Get category name by ID
  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <Card className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Transactions</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="text-sm text-gray-500 hover:text-gray-700">
            <Download className="h-4 w-4 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="text-sm text-gray-500 hover:text-gray-700">
            <SlidersHorizontal className="h-4 w-4 mr-2 sm:mr-1" />
            <span className="hidden sm:inline">Sort</span>
          </Button>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {isLoading ? (
          // Loading skeletons
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))
        ) : currentTransactions.length > 0 ? (
          // Transaction items
          currentTransactions.map(transaction => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {getTransactionIcon(transaction)}
                  <div>
                    <p className="font-medium text-gray-800">{transaction.description || 'Unnamed Transaction'}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.type === 'transfer' ? 'Transfer' : getCategoryName(transaction.categoryId)}
                    </p>
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
                  <p className="text-xs text-gray-500">
                    {transaction.type === 'transfer' 
                      ? `${getAccountName(transaction.accountId)} → ${getAccountName(transaction.toAccountId || 0)}` 
                      : getAccountName(transaction.accountId)
                    }
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No transactions state
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <RefreshCw className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no transactions matching your filters. Try changing your filter criteria or add a new transaction.
            </p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!isLoading && transactions.length > itemsPerPage && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {indexOfLastItem > transactions.length ? transactions.length : indexOfLastItem}
              </span>{" "}
              of <span className="font-medium">{transactions.length}</span> results
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {/* First page */}
                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <span className="px-4 py-2">...</span>
                  </PaginationItem>
                )}
                
                {/* Previous page */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Current page */}
                <PaginationItem>
                  <PaginationLink isActive onClick={() => setCurrentPage(currentPage)}>
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                
                {/* Next page */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                {/* Ellipsis */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <span className="px-4 py-2">...</span>
                  </PaginationItem>
                )}
                
                {/* Last page */}
                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </Card>
  );
}
