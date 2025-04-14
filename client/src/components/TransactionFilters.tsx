import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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

interface FilterOptions {
  dateRange: string;
  categoryId?: number;
  accountId?: number;
  type?: string;
}

interface TransactionFiltersProps {
  categories: Category[];
  accounts: Account[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isLoading: boolean;
}

export default function TransactionFilters({
  categories,
  accounts,
  filters,
  onFilterChange,
  isLoading
}: TransactionFiltersProps) {
  // Handle filter changes
  const handleDateRangeChange = (value: string) => {
    onFilterChange({ ...filters, dateRange: value });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ 
      ...filters, 
      categoryId: value === "all" ? undefined : parseInt(value) 
    });
  };

  const handleAccountChange = (value: string) => {
    onFilterChange({
      ...filters,
      accountId: value === "all" ? undefined : parseInt(value)
    });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({
      ...filters,
      type: value === "all" ? undefined : value
    });
  };

  return (
    <Card className="bg-white rounded-lg shadow">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Range Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Date Range</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="this-month">This month</SelectItem>
                  <SelectItem value="last-month">Last month</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Category Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Category</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={filters.categoryId ? String(filters.categoryId) : "all"}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Account Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Account</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={filters.accountId ? String(filters.accountId) : "all"}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {/* Transaction Type Filter */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Type</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select 
                value={filters.type || "all"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
