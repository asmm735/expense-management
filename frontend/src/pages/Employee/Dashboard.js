import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Submit and track your expense reports
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="rounded-lg bg-white p-8 shadow text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Dashboard</h2>
        <p className="text-gray-600 mb-6">
          Employee expense submission and tracking features are coming soon!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
          <div className="p-4 border rounded-lg">
            <Plus className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Submit Expenses</p>
          </div>
          <div className="p-4 border rounded-lg">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Track Status</p>
          </div>
          <div className="p-4 border rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">View History</p>
          </div>
          <div className="p-4 border rounded-lg">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium">Reports</p>
          </div>
        </div>
        <div className="mt-8">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}