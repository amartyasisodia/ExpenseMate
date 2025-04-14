import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlusIcon, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

export default function Budget() {
  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Query budgets
  const { data: budgets, isLoading: isBudgetsLoading } = useQuery({
    queryKey: [`/api/budgets?month=${currentMonth}&year=${currentYear}`],
  });

  // Query categories for budget categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Query financial summary for income/expense data
  const { data: financialSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: [`/api/financial-summary?month=${currentMonth}&year=${currentYear}`],
  });

  // Query category expenses for budget vs actual
  const { data: categoryExpenses, isLoading: isCategoryExpensesLoading } = useQuery({
    queryKey: [`/api/expenses-by-category?month=${currentMonth}&year=${currentYear}`],
  });

  // Get the overall budget (budget without a category)
  const overallBudget = budgets?.find(budget => !budget.categoryId);
  const overallBudgetAmount = overallBudget?.amount || 0;
  
  // Calculate budget usage for overall budget
  const totalExpenses = financialSummary?.totalExpenses || 0;
  const overallBudgetUsagePercentage = overallBudgetAmount 
    ? Math.min(100, Math.round((totalExpenses / overallBudgetAmount) * 100))
    : 0;

  const isLoading = isBudgetsLoading || isCategoriesLoading || isSummaryLoading || isCategoryExpensesLoading;

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Overall Budget Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            Monthly Budget - {getMonthName(currentMonth)} {currentYear}
          </CardTitle>
          {overallBudget && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Monthly Budget</span>
                <span className="text-sm font-medium text-gray-700">
                  {overallBudgetUsagePercentage}% Used
                </span>
              </div>
              <Progress value={overallBudgetUsagePercentage} className="h-2.5" />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>$0</span>
                <span>
                  {formatCurrency(totalExpenses)} of {formatCurrency(overallBudgetAmount)}
                </span>
                <span>{formatCurrency(overallBudgetAmount)}</span>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Budget Details</h3>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-primary mr-2">Income: {formatCurrency(financialSummary?.totalIncome || 0)}</span>
                    <span className="font-medium text-secondary mr-2">Expenses: {formatCurrency(totalExpenses)}</span>
                    <span className="font-medium text-blue-600">Balance: {formatCurrency((financialSummary?.totalIncome || 0) - totalExpenses)}</span>
                  </div>
                </div>

                {!overallBudget && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-center">
                    <p className="text-amber-800">No monthly budget set for {getMonthName(currentMonth)}.</p>
                    <Button className="mt-2 bg-primary hover:bg-primary/90 text-white">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Set Budget
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Category Budgets */}
      <h2 className="text-lg font-semibold text-gray-900 mt-6">Category Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {budgets?.filter(budget => budget.categoryId)?.map(budget => {
              const category = categories?.find(c => c.id === budget.categoryId);
              const categoryExpense = categoryExpenses?.find(e => e.categoryId === budget.categoryId);
              const expenseAmount = categoryExpense?.amount || 0;
              const usagePercentage = Math.min(100, Math.round((expenseAmount / budget.amount) * 100));
              
              return (
                <Card key={budget.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-800">{category?.name || 'Unknown'}</h3>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>{formatCurrency(expenseAmount)} of {formatCurrency(budget.amount)}</span>
                      <span>{usagePercentage}%</span>
                    </div>
                    <Progress value={usagePercentage} className="h-1.5 mb-2" />
                    <p className="text-xs text-gray-500 mt-2">
                      {expenseAmount > budget.amount 
                        ? <span className="text-secondary font-medium">Over budget by {formatCurrency(expenseAmount - budget.amount)}</span> 
                        : <span className="text-primary font-medium">Remaining: {formatCurrency(budget.amount - expenseAmount)}</span>
                      }
                    </p>
                  </CardContent>
                </Card>
              );
            })}
            
            {/* Add Category Budget Card */}
            <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <Button variant="ghost" className="text-gray-500 flex flex-col gap-1">
                  <PlusIcon className="h-8 w-8" />
                  <span>Add Category Budget</span>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
