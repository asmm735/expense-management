import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  LogOut,
  Upload,
  TrendingUp
} from "lucide-react";
import {
  getEmployeeStats,
  getEmployeeExpenses,
} from "../../api/employee";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch employee data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["employee-stats"],
    queryFn: getEmployeeStats,
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["employee-expenses", filterStatus],
    queryFn: () => getEmployeeExpenses({ status: filterStatus }),
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Signed out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user?.name}! Submit expenses, view history, and check approval status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/employee/submit-expense"
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-lg hover:bg-emerald-700 transition-colors duration-200"
          >
            <PlusCircle className="h-5 w-5" />
            Submit Expense
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Expenses"
          value={stats?.totalExpenses || 0}
          subtitle={`$${stats?.totalAmount || "0.00"} total`}
          icon={FileText}
          bgColor="bg-emerald-500"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Approval"
          value={stats?.pendingExpenses || 0}
          subtitle="Awaiting review"
          icon={Clock}
          bgColor="bg-amber-500"
          loading={statsLoading}
        />
        <StatCard
          title="Approved"
          value={stats?.approvedExpenses || 0}
          subtitle={`$${stats?.approvedAmount || "0.00"} approved`}
          icon={CheckCircle}
          bgColor="bg-green-500"
          loading={statsLoading}
        />
        <StatCard
          title="Rejected"
          value={stats?.rejectedExpenses || 0}
          subtitle="Need revision"
          icon={XCircle}
          bgColor="bg-red-500"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/employee/submit-expense"
            className="group flex items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-emerald-500 hover:shadow-md"
          >
            <div className="rounded-lg bg-emerald-500 p-2 group-hover:scale-110 transition-transform">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600">
                Submit New Expense
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Upload receipt and auto-fill with OCR
              </p>
            </div>
          </Link>

          <div className="group flex items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-green-500 hover:shadow-md cursor-pointer"
               onClick={() => setFilterStatus("all")}>
            <div className="rounded-lg bg-green-500 p-2 group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                View All Expenses
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Check status and history
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-4 transition-all hover:border-amber-500 hover:shadow-md cursor-pointer"
               onClick={() => setFilterStatus("pending")}>
            <div className="rounded-lg bg-amber-500 p-2 group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-amber-600">
                Pending Approvals
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Track approval progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense History */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Expense History</h2>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {expensesLoading ? (
          <div className="py-8 text-center text-gray-500">Loading expenses...</div>
        ) : expenses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Expense ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
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
                    Approval Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                      {expense.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {expense.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {expense.currency} {expense.amount}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <ApprovalProgress expense={expense} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <Link
                        to={`/employee/expense/${expense.id}`}
                        className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No expenses found</p>
            <Link
              to="/employee/submit-expense"
              className="mt-4 inline-block text-sm text-emerald-600 hover:underline"
            >
              Submit your first expense →
            </Link>
          </div>
        )}
      </div>
    </div>
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

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
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

function ApprovalProgress({ expense }) {
  if (expense.status === "approved" || expense.status === "paid") {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <CheckCircle className="h-4 w-4" />
        {expense.status === "paid" ? "Paid" : "Fully Approved"}
      </div>
    );
  }

  if (expense.status === "rejected") {
    return (
      <div className="flex items-center gap-1 text-xs text-red-600">
        <XCircle className="h-4 w-4" />
        Rejected
      </div>
    );
  }

  if (expense.approvalStep) {
    return (
      <div className="text-xs text-amber-600">
        {expense.approvalStep}
      </div>
    );
  }

  return (
    <div className="text-xs text-gray-500">
      Waiting for approval
    </div>
  );
}