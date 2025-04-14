import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpensePieChartProps {
  isLoading: boolean;
  data: Array<{
    categoryId: number;
    categoryName: string;
    amount: number;
  }>;
}

export default function ExpensePieChart({ isLoading, data }: ExpensePieChartProps) {
  // Format data for Recharts
  const chartData = data.map(item => ({
    name: item.categoryName,
    value: item.amount
  }));

  // Colors for the chart
  const COLORS = ['#F43F5E', '#F97316', '#FBBF24', '#10B981', '#3B82F6'];

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-lg shadow">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Expense Categories</h2>
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Skeleton className="h-4/5 w-4/5 rounded-full" />
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={1}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value: string) => (
                    <span className="text-xs">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
