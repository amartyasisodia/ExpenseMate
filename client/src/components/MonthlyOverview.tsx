import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface MonthlyOverviewProps {
  isLoading: boolean;
  data?: {
    budget: number;
    spent: number;
    weeklySpending: Array<{
      startDate: string | Date;
      endDate: string | Date;
      amount: number;
    }>;
  };
  month: number;
  year: number;
}

export default function MonthlyOverview({ isLoading, data, month, year }: MonthlyOverviewProps) {
  const getMonthName = () => {
    const date = new Date(year, month - 1, 1);
    return format(date, 'MMM yyyy');
  };

  // Calculate percentage of budget used
  const budgetPercentage = data?.budget 
    ? Math.min(100, Math.round((data.spent / data.budget) * 100))
    : 0;

  // Format date range (e.g., "03.11 - 09.11")
  const formatDateRange = (startDate: Date | string, endDate: Date | string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${format(start, 'dd.MM')} - ${format(end, 'dd.MM')}`;
  };

  return (
    <Card className="bg-white rounded-lg shadow">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Monthly Overview
          <span className="text-sm font-normal text-gray-500 ml-2">{getMonthName()}</span>
        </h2>
        
        {/* Budget Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Monthly Budget</span>
            <span className="text-sm font-medium text-gray-700">{budgetPercentage}% Used</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-2.5 w-full" />
          ) : (
            <Progress value={budgetPercentage} className="h-2.5" />
          )}
          {isLoading ? (
            <div className="flex justify-between mt-1">
              <Skeleton className="h-3 w-5" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-10" />
            </div>
          ) : (
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>$0</span>
              <span>
                {formatCurrency(data?.spent || 0)} of {formatCurrency(data?.budget || 0)}
              </span>
              <span>{formatCurrency(data?.budget || 0)}</span>
            </div>
          )}
        </div>
        
        {/* Weekly Spending */}
        <h3 className="text-sm font-medium text-gray-700 mb-2">Weekly Spending</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-1.5 w-full" />
              </div>
            ))}
          </div>
        ) : data?.weeklySpending && data.weeklySpending.length > 0 ? (
          <div className="space-y-3">
            {data.weeklySpending.map((week, index) => {
              // Calculate percentage of budget used for this week
              const weeklyPercentage = data.budget 
                ? Math.min(100, Math.round((week.amount / data.budget) * 100 * 4)) // Multiply by 4 for weekly portion
                : 0;
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{formatDateRange(week.startDate, week.endDate)}</span>
                    <span className="font-medium">{formatCurrency(week.amount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-secondary h-1.5 rounded-full" 
                      style={{ width: `${weeklyPercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 text-sm">
            No weekly spending data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
