import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { getAllExpenses, overrideExpenseStatus } from "../../api/admin";

export default function ExpensesOverview() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedExpense, setSelectedExpense] = useState(null);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["all-expenses", statusFilter, dateFilter],
    queryFn: () => getAllExpenses({ status: statusFilter, date: dateFilter }),
  });

  const overrideMutation = useMutation({
    mutationFn: ({ id, status, comment }) =>
      overrideExpenseStatus(id, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries(["all-expenses"]);
      setSelectedExpense(null);
    },
  });

  const filteredExpenses = expenses?.filter((expense) =>
    expense.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    expense.id?.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/dashboard" className="text-sm text-emerald-600 hover:underline mb-2 block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Expenses Overview</h1>
        <p className="mt-2 text-sm text-gray-600">
          View all expenses and override approval decisions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading expenses...</div>
        ) : filteredExpenses?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID
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
                      {expense.employeeName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {expense.category}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {expense.currency} {expense.amount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <StatusBadge status={expense.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Link
                          to={`/expenses/${expense.id}`}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setSelectedExpense(expense)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          Override
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">No expenses found</div>
        )}
      </div>

      {/* Override Modal */}
      {selectedExpense && (
        <OverrideModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onOverride={(status, comment) => {
            overrideMutation.mutate({
              id: selectedExpense.id,
              status,
              comment,
            });
          }}
        />
      )}
    </div>
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

function OverrideModal({ expense, onClose, onOverride }) {
  const [status, setStatus] = useState(expense.status);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onOverride(status, comment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Override Expense Status
        </h2>
        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Expense ID:</span> #{expense.id}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Employee:</span> {expense.employeeName}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Amount:</span> {expense.currency}{" "}
            {expense.amount}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Current Status:</span>{" "}
            <StatusBadge status={expense.status} />
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Admin Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              required
              placeholder="Reason for override..."
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Override Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}