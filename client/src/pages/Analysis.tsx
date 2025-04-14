import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Analysis() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Categories query
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Category expenses query for pie chart
  const { data: categoryExpenses, isLoading: isCategoryLoading } = useQuery({
    queryKey: [`/api/expenses-by-category?month=${selectedMonth}&year=${selectedYear}`],
  });

  // Monthly overview query
  const { data: monthlyOverview, isLoading: isOverviewLoading } = useQuery({
    queryKey: [`/api/monthly-overview?month=${selectedMonth}&year=${selectedYear}`],
  });

  // Financial summary query for the year
  const { data: yearlySummary, isLoading: isYearlySummaryLoading } = useQuery({
    queryKey: [`/api/financial-summary?year=${selectedYear}`],
  });

  const isLoading = isCategoriesLoading || isCategoryLoading || isOverviewLoading || isYearlySummaryLoading;

  // Prepare data for the pie chart
  const pieChartData = categoryExpenses?.map(item => ({
    name: categories?.find(c => c.id === item.categoryId)?.name || item.categoryName,
    value: item.amount
  })) || [];

  // Colors for the pie chart
  const COLORS = ['#F43F5E', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];

  // Generate monthly data for the bar chart
  const generateMonthlyData = () => {
    const data = [];
    for (let i = 1; i <= 12; i++) {
      data.push({
        month: format(new Date(selectedYear, i - 1, 1), 'MMM'),
        income: Math.random() * 4000 + 2000, // Simulated data
        expenses: Math.random() * 3000 + 1000 // Simulated data
      });
    }
    return data;
  };

  const barChartData = generateMonthlyData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Expense Analysis</h1>

      {/* Time Period Selector */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select 
                  className="block w-full p-2 border border-gray-300 rounded-md"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {format(new Date(2000, i, 1), 'MMMM')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select 
                  className="block w-full p-2 border border-gray-300 rounded-md"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="category">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Category Analysis Tab */}
        <TabsContent value="category" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-4/5 w-4/5 rounded-full" />
                  </div>
                ) : pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No expense data available for this period
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : pieChartData.length > 0 ? (
                  <div className="space-y-4">
                    {pieChartData
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 5)
                      .map((category, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <span className="text-sm font-semibold">{formatCurrency(category.value)}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No expense data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses ({selectedYear})</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#10B981" />
                    <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Tab */}
        <TabsContent value="yearly" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-primary">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(yearlySummary?.totalIncome || 0)}</p>
                <p className="text-sm text-gray-500">For year {selectedYear}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-secondary">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(yearlySummary?.totalExpenses || 0)}</p>
                <p className="text-sm text-gray-500">For year {selectedYear}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-600">Net Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency((yearlySummary?.totalIncome || 0) - (yearlySummary?.totalExpenses || 0))}</p>
                <p className="text-sm text-gray-500">For year {selectedYear}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-center text-gray-500 py-10">
                Advanced spending trend analysis will be available in the next update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
