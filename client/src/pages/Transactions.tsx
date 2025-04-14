import { useQuery } from "@tanstack/react-query";
import TransactionFilters from "@/components/TransactionFilters";
import TransactionList from "@/components/TransactionList";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface TransactionsProps {
  onAddTransaction: () => void;
}

export default function Transactions({ onAddTransaction }: TransactionsProps) {
  // State for filters
  const [filters, setFilters] = useState({
    dateRange: 'this-month',
    categoryId: undefined as number | undefined,
    accountId: undefined as number | undefined,
    type: undefined as string | undefined,
  });

  // Process filters for the API query
  const getQueryFilters = () => {
    const queryParams = new URLSearchParams();
    
    if (filters.dateRange === 'last-7-days') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      queryParams.append('startDate', startDate.toISOString());
      queryParams.append('endDate', endDate.toISOString());
    } else if (filters.dateRange === 'last-30-days') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      queryParams.append('startDate', startDate.toISOString());
      queryParams.append('endDate', endDate.toISOString());
    } else if (filters.dateRange === 'this-month') {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      queryParams.append('startDate', startDate.toISOString());
      queryParams.append('endDate', now.toISOString());
    } else if (filters.dateRange === 'last-month') {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      queryParams.append('startDate', startDate.toISOString());
      queryParams.append('endDate', endDate.toISOString());
    }
    
    if (filters.categoryId !== undefined) {
      queryParams.append('categoryId', String(filters.categoryId));
    }
    
    if (filters.accountId !== undefined) {
      queryParams.append('accountId', String(filters.accountId));
    }
    
    if (filters.type !== undefined) {
      queryParams.append('type', filters.type);
    }
    
    return queryParams.toString();
  };

  // Categories query for filter dropdown
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Accounts query for filter dropdown
  const { data: accounts, isLoading: isAccountsLoading } = useQuery({
    queryKey: ['/api/accounts'],
  });

  // Transactions query with filters
  const queryFilters = getQueryFilters();
  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: [`/api/transactions?${queryFilters}`],
  });

  return (
    <div className="space-y-6">
      {/* Add Transaction Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onAddTransaction}
          className="bg-primary hover:bg-primary/90 text-white font-medium"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Transaction Filters */}
      <TransactionFilters 
        categories={categories || []}
        accounts={accounts || []}
        filters={filters}
        onFilterChange={setFilters}
        isLoading={isCategoriesLoading || isAccountsLoading}
      />

      {/* Transaction List */}
      <TransactionList 
        transactions={transactions || []}
        isLoading={isTransactionsLoading}
        accounts={accounts || []}
        categories={categories || []}
      />
    </div>
  );
}
