import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface FinancialSummaryProps {
  isLoading: boolean;
  data?: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    lastUpdated: string | Date;
  };
}

export default function FinancialSummary({ isLoading, data }: FinancialSummaryProps) {
  const lastUpdated = data?.lastUpdated 
    ? format(new Date(data.lastUpdated), "MMM dd, yyyy")
    : format(new Date(), "MMM dd, yyyy");

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Total Income</span>
            <ArrowUp className="h-5 w-5 text-primary" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-2 bg-green-100" />
          ) : (
            <p className="text-2xl font-bold text-primary mt-2">
              {formatCurrency(data?.totalIncome || 0)}
            </p>
          )}
          <span className="text-xs text-gray-500">Last updated: {lastUpdated}</span>
        </div>
        
        {/* Expenses Card */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Total Expenses</span>
            <ArrowDown className="h-5 w-5 text-secondary" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-2 bg-red-100" />
          ) : (
            <p className="text-2xl font-bold text-secondary mt-2">
              {formatCurrency(data?.totalExpenses || 0)}
            </p>
          )}
          <span className="text-xs text-gray-500">Last updated: {lastUpdated}</span>
        </div>
        
        {/* Balance Card */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Current Balance</span>
            <Clock className="h-5 w-5 text-accent" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mt-2 bg-blue-100" />
          ) : (
            <p className="text-2xl font-bold text-accent mt-2">
              {formatCurrency(data?.balance || 0)}
            </p>
          )}
          <span className="text-xs text-gray-500">Last updated: {lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
