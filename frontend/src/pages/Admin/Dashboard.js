import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Users,
  ClipboardCheck,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

// API functions (implement in src/api/admin.js)
import {
  getAdminStats,
  getPendingApprovals,
  getRecentExpenses,
  getAllUsers,
} from "../../api/admin";

export default function AdminDashboard() {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
  });

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ["pending-approvals-dashboard"],
    queryFn: () => getPendingApprovals({ limit: 10 }),
  });

  const { data: recentExpenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["recent-expenses-dashboard"],
    queryFn: () => getRecentExpenses({ limit: 10 }),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users-summary"],
    queryFn: getAllUsers,
  });

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Comprehensive overview of expense management system
          </p>
        </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Expenses"
          value={stats?.totalExpenses || 0}
          subtitle={`${stats?.currency || "USD"} ${stats?.totalAmount || "0.00"}`}
          icon={DollarSign}
          bgColor="bg-emerald-500"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          subtitle="Awaiting review"
          icon={Clock}
          bgColor="bg-amber-500"
          loading={statsLoading}
        />
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          subtitle={`${stats?.activeUsers || 0} active`}
          icon={Users}
          bgColor="bg-emerald-600"
          loading={statsLoading}
        />
        <StatCard
          title="Approved This Month"
          value={stats?.approvedThisMonth || 0}
          subtitle={`${stats?.rejectedThisMonth || 0} rejected`}
          icon={CheckCircle}
          bgColor="bg-emerald-400"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionButton
            to="/admin/users"
            icon={Users}
            label="Manage Users"
            description="Create, edit, assign roles"
          />
          <ActionButton
            to="/admin/approval-rules"
            icon={ClipboardCheck}
            label="Approval Rules"
            description="Configure workflows"
          />
          <ActionButton
            to="/admin/expenses-overview"
            icon={BarChart3}
            label="All Expenses"
            description="View and override"
          />
          <ActionButton
            to="/admin/company-settings"
            icon={DollarSign}
            label="Company Settings"
            description="Currency, policies"
          />
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <Link
            to="/approvals"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All →
          </Link>
        </div>
        {approvalsLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : pendingApprovals?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expense ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pendingApprovals.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                      #{expense.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {expense.employeeName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {expense.currency} {expense.amount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      {new Date(expense.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                        {expense.currentStep || "Pending"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No pending approvals
          </div>
        )}
      </div>

      {/* Recent Expenses Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
          <Link
            to="/admin/expenses-overview"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            View All →
          </Link>
        </div>
        {expensesLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : recentExpenses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expense ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                      #{expense.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {expense.employeeName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {expense.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {expense.currency} {expense.amount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="text-emerald-600 hover:text-emerald-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            No recent expenses
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}

// Reusable Components
function StatCard({ title, value, subtitle, icon: Icon, bgColor, loading }) {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {loading ? "..." : value}
          </p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`rounded-full ${bgColor} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ to, icon: Icon, label, description }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-emerald-500 hover:shadow-md"
    >
      <div className="rounded-lg bg-emerald-50 p-2">
        <Icon className="h-5 w-5 text-emerald-600" />
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{label}</h3>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-emerald-100 text-emerald-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
        styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}