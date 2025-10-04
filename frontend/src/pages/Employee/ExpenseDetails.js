import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Download,
  User,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Receipt,
  LogOut
} from "lucide-react";
import { getExpenseById } from "../../api/employee";

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { data: expense, isLoading, error } = useQuery({
    queryKey: ["expense-details", id],
    queryFn: () => getExpenseById(id),
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Signed out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !expense) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-2 text-lg font-semibold text-red-900">Expense Not Found</h2>
            <p className="mt-1 text-sm text-red-600">
              The expense you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              to="/employee/dashboard"
              className="mt-4 inline-block rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/employee/dashboard"
              className="mb-2 flex items-center gap-2 text-sm text-emerald-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Expense Details
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Expense ID: {expense.id}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Overview */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Expense Overview</h2>
                <StatusBadge status={expense.status} />
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-medium text-gray-900">{expense.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium text-gray-900">
                      {expense.currency} {expense.amount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted By</p>
                    <p className="font-medium text-gray-900">{expense.employeeName || user?.name}</p>
                  </div>
                </div>
              </div>

              {expense.description && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="mt-1 text-gray-900">{expense.description}</p>
                </div>
              )}
            </div>

            {/* Line Items */}
            {expense.lineItems && expense.lineItems.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Line Items</h2>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {expense.lineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {expense.currency} {item.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-gray-900">
                          {expense.currency} {expense.amount}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Approval History */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Approval History</h2>
              <div className="space-y-4">
                {expense.approvalHistory && expense.approvalHistory.length > 0 ? (
                  expense.approvalHistory.map((approval, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`rounded-full p-1 ${
                        approval.action === 'approved' ? 'bg-green-100' :
                        approval.action === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                      }`}>
                        {approval.action === 'approved' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {approval.action === 'rejected' && <XCircle className="h-5 w-5 text-red-600" />}
                        {approval.action === 'pending' && <Clock className="h-5 w-5 text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {approval.approverName} ({approval.approverRole})
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(approval.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className={`text-sm capitalize ${
                          approval.action === 'approved' ? 'text-green-600' :
                          approval.action === 'rejected' ? 'text-red-600' : 'text-amber-600'
                        }`}>
                          {approval.action}
                        </p>
                        {approval.comment && (
                          <p className="mt-1 text-sm text-gray-600">{approval.comment}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <Clock className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No approval actions yet</p>
                    <p className="text-xs text-gray-400">Your expense is waiting for review</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Reason */}
            {expense.status === 'rejected' && expense.rejectionReason && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Rejection Reason</h3>
                    <p className="mt-1 text-sm text-red-700">{expense.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Receipt */}
            {expense.receiptUrl && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Receipt</h3>
                <div className="space-y-3">
                  <img
                    src={expense.receiptUrl}
                    alt="Receipt"
                    className="w-full rounded-lg border"
                  />
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                    <Download className="h-4 w-4" />
                    Download Receipt
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Actions</h3>
              <div className="space-y-3">
                {expense.status === 'pending' && (
                  <button className="w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
                    Edit Expense
                  </button>
                )}
                
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Print Details
                </button>
                
                <button className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Export PDF
                </button>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Status Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.submittedAt || expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className={`flex items-center gap-3 ${
                  expense.status === 'pending' ? 'opacity-50' : ''
                }`}>
                  <div className={`rounded-full p-1 ${
                    expense.status === 'approved' ? 'bg-green-100' :
                    expense.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {expense.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                    {expense.status === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                    {expense.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {expense.status === 'approved' ? 'Approved' :
                       expense.status === 'rejected' ? 'Rejected' : 'Under Review'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.status !== 'pending' ? 
                        new Date(expense.reviewedAt || Date.now()).toLocaleDateString() :
                        'Pending approval'
                      }
                    </p>
                  </div>
                </div>

                {expense.status === 'approved' && (
                  <div className={`flex items-center gap-3 ${
                    expense.paymentStatus !== 'paid' ? 'opacity-50' : ''
                  }`}>
                    <div className={`rounded-full p-1 ${
                      expense.paymentStatus === 'paid' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {expense.paymentStatus === 'paid' ? 
                        <CreditCard className="h-4 w-4 text-blue-600" /> :
                        <Clock className="h-4 w-4 text-gray-400" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {expense.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {expense.paymentStatus === 'paid' ? 
                          new Date(expense.paidAt || Date.now()).toLocaleDateString() :
                          'Awaiting payment processing'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    paid: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const icons = {
    pending: <Clock className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    rejected: <XCircle className="h-4 w-4" />,
    paid: <CreditCard className="h-4 w-4" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status?.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      {icons[status?.toLowerCase()] || <AlertTriangle className="h-4 w-4" />}
      {status}
    </span>
  );
}