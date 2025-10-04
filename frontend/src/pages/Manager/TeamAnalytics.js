import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Filter,
  Download,
  Eye,
  TrendingUp,
  PieChart
} from "lucide-react";
import { getTeamExpenses, getManagerStats } from "../../api/manager";

export default function TeamAnalytics() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");

  // Fetch data
  const { data: stats } = useQuery({
    queryKey: ["manager-stats"],
    queryFn: getManagerStats,
  });

  const { data: teamExpenses, isLoading } = useQuery({
    queryKey: ["team-expenses", statusFilter],
    queryFn: () => getTeamExpenses({ status: statusFilter }),
  });

  // Get unique employees for filter
  const employees = teamExpenses?.reduce((acc, expense) => {
    if (!acc.find(emp => emp.name === expense.employeeName)) {
      acc.push({ name: expense.employeeName, id: expense.employeeId });
    }
    return acc;
  }, []) || [];

  // Filter expenses based on all filters
  const filteredExpenses = teamExpenses?.filter(expense => {
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    const matchesEmployee = employeeFilter === "all" || expense.employeeName === employeeFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      switch (dateFilter) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= monthAgo;
          break;
        case "quarter":
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          matchesDate = expenseDate >= quarterAgo;
          break;
      }
    }
    
    return matchesStatus && matchesEmployee && matchesDate;
  }) || [];

  // Calculate analytics
  const analytics = {
    totalExpenses: filteredExpenses.length,
    approvedCount: filteredExpenses.filter(e => e.status === 'approved').length,
    rejectedCount: filteredExpenses.filter(e => e.status === 'rejected').length,
    pendingCount: filteredExpenses.filter(e => e.status === 'pending').length,
    paidCount: filteredExpenses.filter(e => e.status === 'paid').length,
    totalAmount: filteredExpenses.reduce((sum, e) => sum + parseFloat(e.convertedAmount || 0), 0),
    approvedAmount: filteredExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + parseFloat(e.convertedAmount || 0), 0),
    rejectedAmount: filteredExpenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + parseFloat(e.convertedAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            to="/manager/dashboard"
            className="mb-2 block text-sm text-emerald-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Team Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive view of team expense patterns and approval statistics
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsCard
          title="Total Expenses"
          value={analytics.totalExpenses}
          subtitle="In selected period"
          icon={PieChart}
          bgColor="bg-blue-500"
        />
        <AnalyticsCard
          title="Approved"
          value={analytics.approvedCount}
          subtitle={`${stats?.currency} ${analytics.approvedAmount.toFixed(2)}`}
          icon={CheckCircle}
          bgColor="bg-emerald-500"
        />
        <AnalyticsCard
          title="Rejected"
          value={analytics.rejectedCount}
          subtitle={`${stats?.currency} ${analytics.rejectedAmount.toFixed(2)}`}
          icon={XCircle}
          bgColor="bg-red-500"
        />
        <AnalyticsCard
          title="Pending"
          value={analytics.pendingCount}
          subtitle="Awaiting approval"
          icon={Clock}
          bgColor="bg-amber-500"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Employees</option>
              {employees.map((employee) => (
                <option key={employee.name} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter("all");
                setEmployeeFilter("all");
                setDateFilter("all");
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Approval Rate Chart */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="text-sm font-medium">
                {analytics.totalExpenses > 0 
                  ? `${((analytics.approvedCount / analytics.totalExpenses) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-emerald-500 rounded-full"
                style={{
                  width: analytics.totalExpenses > 0 
                    ? `${(analytics.approvedCount / analytics.totalExpenses) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejection Rate</span>
              <span className="text-sm font-medium">
                {analytics.totalExpenses > 0 
                  ? `${((analytics.rejectedCount / analytics.totalExpenses) * 100).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-red-500 rounded-full"
                style={{
                  width: analytics.totalExpenses > 0 
                    ? `${(analytics.rejectedCount / analytics.totalExpenses) * 100}%`
                    : '0%'
                }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Amount</span>
              <span className="text-sm font-medium">
                {stats?.currency} {analytics.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg per Expense</span>
              <span className="text-sm font-medium">
                {stats?.currency} {analytics.totalExpenses > 0 ? (analytics.totalAmount / analytics.totalExpenses).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Team Members</span>
              <span className="text-sm font-medium">{employees.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Team Expenses ({filteredExpenses.length})
            </h3>
            <div className="text-sm text-gray-500">
              All amounts in {stats?.currency}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expense ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{expense.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        {expense.employeeName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {expense.category}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {stats?.currency} {expense.convertedAmount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Filter className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No expenses found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Components
function AnalyticsCard({ title, value, subtitle, icon: Icon, bgColor }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-blue-100 text-blue-800",
  };

  const icons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    paid: DollarSign,
  };

  const Icon = icons[status?.toLowerCase()] || Clock;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800"
      }`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}