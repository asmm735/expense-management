import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Check,
  X,
  SelectAll,
  MessageCircle,
  LogOut
} from "lucide-react";
import {
  getPendingApprovalsForManager,
  approveExpense,
  rejectExpense,
  getManagerStats
} from "../../api/manager";

export default function BulkApproval() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [bulkComment, setBulkComment] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Fetch data
  const { data: stats } = useQuery({
    queryKey: ["manager-stats"],
    queryFn: getManagerStats,
  });

  const { data: pendingExpenses, isLoading: dataLoading } = useQuery({
    queryKey: ["pending-approvals-manager"],
    queryFn: getPendingApprovalsForManager,
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async ({ expenseIds, comment }) => {
      const results = await Promise.all(
        expenseIds.map(id => approveExpense(id, comment))
      );
      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["pending-approvals-manager"]);
      queryClient.invalidateQueries(["team-expenses"]);
      queryClient.invalidateQueries(["manager-stats"]);
      toast.success(`${selectedExpenses.length} expenses approved successfully!`);
      setSelectedExpenses([]);
      setShowBulkModal(false);
      setBulkComment("");
    },
    onError: (error) => {
      toast.error('Failed to approve expenses. Please try again.');
      console.error('Bulk approve error:', error);
    },
  });

  // Bulk reject mutation
  const bulkRejectMutation = useMutation({
    mutationFn: async ({ expenseIds, comment }) => {
      const results = await Promise.all(
        expenseIds.map(id => rejectExpense(id, comment))
      );
      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["pending-approvals-manager"]);
      queryClient.invalidateQueries(["team-expenses"]);
      queryClient.invalidateQueries(["manager-stats"]);
      toast.success(`${selectedExpenses.length} expenses rejected successfully!`);
      setSelectedExpenses([]);
      setShowBulkModal(false);
      setBulkComment("");
    },
    onError: (error) => {
      toast.error('Failed to reject expenses. Please try again.');
      console.error('Bulk reject error:', error);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  // Handle individual checkbox
  const handleSelectExpense = (expenseId) => {
    setSelectedExpenses(prev => 
      prev.includes(expenseId)
        ? prev.filter(id => id !== expenseId)
        : [...prev, expenseId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedExpenses.length === pendingExpenses?.length) {
      setSelectedExpenses([]);
    } else {
      setSelectedExpenses(pendingExpenses?.map(expense => expense.id) || []);
    }
  };

  // Handle bulk action
  const handleBulkAction = (action) => {
    if (selectedExpenses.length === 0) {
      toast.error('Please select at least one expense');
      return;
    }
    setBulkAction(action);
    setShowBulkModal(true);
  };

  // Handle bulk submit
  const handleBulkSubmit = () => {
    if (!bulkComment.trim()) {
      toast.error('Please add a comment');
      return;
    }

    if (bulkAction === 'approve') {
      bulkApproveMutation.mutate({ 
        expenseIds: selectedExpenses, 
        comment: bulkComment 
      });
    } else {
      bulkRejectMutation.mutate({ 
        expenseIds: selectedExpenses, 
        comment: bulkComment 
      });
    }
  };

  const isAllSelected = pendingExpenses?.length > 0 && selectedExpenses.length === pendingExpenses.length;
  const isLoading = bulkApproveMutation.isLoading || bulkRejectMutation.isLoading;

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
          <h1 className="text-3xl font-bold text-gray-900">Bulk Approval</h1>
          <p className="mt-2 text-sm text-gray-600">
            Select multiple expenses to approve or reject in bulk
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

      {/* Selection Summary */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="selectAll"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">
                Select All ({pendingExpenses?.length || 0} expenses)
              </label>
            </div>
            
            {selectedExpenses.length > 0 && (
              <div className="text-sm text-emerald-600 font-medium">
                {selectedExpenses.length} selected
              </div>
            )}
          </div>

          {selectedExpenses.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Bulk Approve ({selectedExpenses.length})
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Bulk Reject ({selectedExpenses.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Expenses ({pendingExpenses?.length || 0})
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            All amounts shown in company currency: {stats?.currency}
          </p>
        </div>

        {dataLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : pendingExpenses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
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
                    Original Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount ({stats?.currency})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {pendingExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    className={`hover:bg-gray-50 ${
                      selectedExpenses.includes(expense.id) ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={() => handleSelectExpense(expense.id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      #{expense.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">{expense.employeeName}</div>
                          <div className="text-xs text-gray-500">{expense.employeeEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {expense.category}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      <div className="font-medium">
                        {expense.currency} {expense.amount}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      <div className="font-medium text-emerald-600">
                        {stats?.currency} {expense.convertedAmount}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      <div className="truncate" title={expense.description}>
                        {expense.description || 'No description'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No pending expenses for bulk approval</p>
            <Link
              to="/manager/dashboard"
              className="mt-4 inline-flex items-center text-emerald-600 hover:text-emerald-800"
            >
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Bulk Action Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              {bulkAction === 'approve' ? 'Bulk Approve Expenses' : 'Bulk Reject Expenses'}
            </h2>

            {/* Selected Expenses Summary */}
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Selected Expenses:</span>
                <span className="font-medium text-gray-900">{selectedExpenses.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount ({stats?.currency}):</span>
                <span className="font-bold text-emerald-600">
                  {stats?.currency} {
                    pendingExpenses
                      ?.filter(expense => selectedExpenses.includes(expense.id))
                      .reduce((sum, expense) => sum + parseFloat(expense.convertedAmount || 0), 0)
                      .toFixed(2)
                  }
                </span>
              </div>
            </div>

            {/* Comment Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bulkAction === 'approve' ? 'Bulk Approval Comment *' : 'Bulk Rejection Reason *'}
              </label>
              <textarea
                value={bulkComment}
                onChange={(e) => setBulkComment(e.target.value)}
                rows={4}
                required
                placeholder={
                  bulkAction === 'approve'
                    ? "Add comment for all approved expenses..."
                    : "Explain the reason for rejecting these expenses..."
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                This comment will be applied to all selected expenses
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowBulkModal(false);
                  setBulkComment("");
                }}
                disabled={isLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={isLoading || !bulkComment.trim()}
                className={`rounded-lg px-4 py-2 text-white disabled:opacity-50 ${
                  bulkAction === 'approve'
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isLoading
                  ? "Processing..."
                  : bulkAction === 'approve'
                  ? `Approve ${selectedExpenses.length} Expenses`
                  : `Reject ${selectedExpenses.length} Expenses`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}