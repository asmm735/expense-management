import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Eye,
  MessageCircle,
  TrendingUp,
  FileText,
  LogOut
} from "lucide-react";
import {
  getManagerStats,
  getPendingApprovalsForManager,
  getTeamExpenses,
  approveExpense,
  rejectExpense,
} from "../../api/manager";

export default function ManagerDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [comment, setComment] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  // Fetch manager data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["manager-stats"],
    queryFn: getManagerStats,
  });

  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ["pending-approvals-manager"],
    queryFn: getPendingApprovalsForManager,
  });

  const { data: teamExpenses, isLoading: teamLoading } = useQuery({
    queryKey: ["team-expenses", filterStatus],
    queryFn: () => getTeamExpenses({ status: filterStatus }),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ expenseId, comment }) => approveExpense(expenseId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(["pending-approvals-manager"]);
      queryClient.invalidateQueries(["team-expenses"]);
      queryClient.invalidateQueries(["manager-stats"]);
      toast.success('Expense approved successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error('Failed to approve expense. Please try again.');
      console.error('Approve expense error:', error);
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ expenseId, comment }) => rejectExpense(expenseId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(["pending-approvals-manager"]);
      queryClient.invalidateQueries(["team-expenses"]);
      queryClient.invalidateQueries(["manager-stats"]);
      toast.success('Expense rejected successfully!');
      handleCloseModal();
    },
    onError: (error) => {
      toast.error('Failed to reject expense. Please try again.');
      console.error('Reject expense error:', error);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleOpenModal = (expense, action) => {
    setSelectedExpense(expense);
    setActionType(action);
    setComment("");
  };

  const handleCloseModal = () => {
    setSelectedExpense(null);
    setActionType(null);
    setComment("");
  };

  const handleSubmitAction = () => {
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    if (actionType === "approve") {
      approveMutation.mutate({ expenseId: selectedExpense.id, comment });
    } else {
      rejectMutation.mutate({ expenseId: selectedExpense.id, comment });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user?.name}! Approve/reject expenses, view team expenses, and manage approvals
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Approvals"
          value={stats?.pendingApprovals || 0}
          subtitle="Awaiting your review"
          icon={Clock}
          bgColor="bg-amber-500"
          loading={statsLoading}
        />
        <StatCard
          title="Approved This Month"
          value={stats?.approvedThisMonth || 0}
          subtitle={`${stats?.currency || "USD"} ${stats?.approvedAmount || "0.00"}`}
          icon={CheckCircle}
          bgColor="bg-emerald-500"
          loading={statsLoading}
        />
        <StatCard
          title="Team Expenses"
          value={stats?.totalTeamExpenses || 0}
          subtitle="All time"
          icon={Users}
          bgColor="bg-blue-500"
          loading={statsLoading}
        />
        <StatCard
          title="Total Amount"
          value={`${stats?.currency || "USD"} ${stats?.totalAmount || "0.00"}`}
          subtitle="Company currency"
          icon={DollarSign}
          bgColor="bg-purple-500"
          loading={statsLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          to="/manager/bulk-approval"
          className="rounded-lg bg-white p-4 shadow border-l-4 border-l-emerald-500 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Quick Action</p>
              <p className="text-lg font-semibold text-gray-900">Bulk Approve</p>
            </div>
          </div>
        </Link>
        <Link
          to="/manager/team-analytics"
          className="rounded-lg bg-white p-4 shadow border-l-4 border-l-blue-500 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Reports</p>
              <p className="text-lg font-semibold text-gray-900">Team Analytics</p>
            </div>
          </div>
        </Link>
        <div className="rounded-lg bg-white p-4 shadow border-l-4 border-l-purple-500 cursor-pointer hover:bg-gray-50 transition-colors">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Communication</p>
              <p className="text-lg font-semibold text-gray-900">Team Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Expenses Waiting for Approval
          </h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {pendingApprovals?.length || 0} Pending
          </span>
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
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount ({stats?.currency})
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
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
                      <div>
                        <div className="font-medium">{expense.employeeName}</div>
                        <div className="text-xs text-gray-500">
                          {expense.employeeEmail}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      {expense.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {expense.currency} {expense.amount}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-700">
                      <div className="font-medium text-emerald-600">
                        {stats?.currency} {expense.convertedAmount}
                      </div>
                      <div className="text-xs text-gray-500">
                        Company currency
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleOpenModal(expense, "approve")}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenModal(expense, "reject")}
                          className="flex items-center gap-1 text-red-600 hover:text-red-800"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No pending approvals</p>
          </div>
        )}
      </div>

      {/* Team Expenses Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Team Expenses</h2>
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

        <p className="mb-4 text-sm text-gray-600">
          All amounts shown in company's default currency: <strong>{stats?.currency}</strong>
        </p>

        {teamLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : teamExpenses?.length > 0 ? (
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
                    Amount ({stats?.currency})
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
                {teamExpenses.map((expense) => (
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
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                      {stats?.currency} {expense.convertedAmount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm">
                      <button className="text-emerald-600 hover:text-emerald-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No team expenses found</div>
        )}
      </div>

      {/* Approval/Rejection Modal */}
      {selectedExpense && (
        <ApprovalModal
          expense={selectedExpense}
          actionType={actionType}
          comment={comment}
          setComment={setComment}
          onClose={handleCloseModal}
          onSubmit={handleSubmitAction}
          isLoading={approveMutation.isLoading || rejectMutation.isLoading}
          companyCurrency={stats?.currency}
        />
      )}
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
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-blue-100 text-blue-800",
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

function ApprovalModal({
  expense,
  actionType,
  comment,
  setComment,
  onClose,
  onSubmit,
  isLoading,
  companyCurrency,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {actionType === "approve" ? "Approve Expense" : "Reject Expense"}
        </h2>

        {/* Expense Details */}
        <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expense ID:</span>
            <span className="font-medium text-gray-900">#{expense.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Employee:</span>
            <span className="font-medium text-gray-900">{expense.employeeName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium text-gray-900">{expense.category}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Original Amount:</span>
            <span className="font-medium text-gray-900">
              {expense.currency} {expense.amount}
            </span>
          </div>
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-gray-600">Amount ({companyCurrency}):</span>
            <span className="font-bold text-emerald-600">
              {companyCurrency} {expense.convertedAmount}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-900">
              {new Date(expense.date).toLocaleDateString()}
            </span>
          </div>
          {expense.description && (
            <div className="text-sm border-t pt-2">
              <span className="text-gray-600">Description:</span>
              <p className="mt-1 text-gray-900">{expense.description}</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {actionType === "approve" ? "Approval Comment *" : "Rejection Reason *"}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
            placeholder={
              actionType === "approve"
                ? "Add your approval comment..."
                : "Explain the reason for rejection..."
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            This comment will be visible to the employee
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !comment.trim()}
            className={`rounded-lg px-4 py-2 text-white disabled:opacity-50 ${
              actionType === "approve"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading
              ? "Processing..."
              : actionType === "approve"
              ? "Approve Expense"
              : "Reject Expense"}
          </button>
        </div>
      </div>
    </div>
  );
}