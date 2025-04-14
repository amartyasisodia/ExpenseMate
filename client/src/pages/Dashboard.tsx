import FinancialSummary from "@/components/FinancialSummary";
import ExpensePieChart from "@/components/ExpensePieChart";
import MonthlyOverview from "@/components/MonthlyOverview";
import RecentTransactions from "@/components/RecentTransactions";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  // Get current month and year for queries
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Financial summary query
  const { data: financialSummary, isLoading: isSummaryLoading } = useQuery({
    queryKey: [`/api/financial-summary?month=${currentMonth}&year=${currentYear}`],
  });

  // Category expenses query for pie chart
  const { data: categoryExpenses, isLoading: isCategoryLoading } = useQuery({
    queryKey: [`/api/expenses-by-category?month=${currentMonth}&year=${currentYear}`],
  });

  // Monthly overview query
  const { data: monthlyOverview, isLoading: isOverviewLoading } = useQuery({
    queryKey: [`/api/monthly-overview?month=${currentMonth}&year=${currentYear}`],
  });

  // Recent transactions query
  const { data: transactions, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Get 5 most recent transactions
  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Financial Summary Component */}
      <FinancialSummary 
        isLoading={isSummaryLoading}
        data={financialSummary}
      />

      {/* Expense Categories & Monthly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Chart */}
        <ExpensePieChart 
          isLoading={isCategoryLoading}
          data={categoryExpenses || []}
        />

        {/* Monthly Overview */}
        <MonthlyOverview 
          isLoading={isOverviewLoading}
          data={monthlyOverview}
          month={currentMonth}
          year={currentYear}
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions 
        isLoading={isTransactionsLoading}
        transactions={recentTransactions}
      />
    </div>
  );
}
