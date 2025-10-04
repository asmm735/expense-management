import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Upload, Plus } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';
import ReceiptUploadModal from '../components/ReceiptUploadModal';

const fetchExpenses = async () => {
  const res = await api.get('/expenses/my');
  return res.data;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data = [], isLoading, refetch } = useQuery(['myExpenses'], fetchExpenses, {
    // Poll every 5 seconds to keep status in sync with backend admin actions
    refetchInterval: 5000,
    // Also refetch when window is focused to get latest state
    refetchOnWindowFocus: true,
  });
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const openNew = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [ocrPrefill, setOcrPrefill] = useState(null);

  const openUpload = () => {
    setIsUploadOpen(true);
  };

  const onRowClick = (expense) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // refetch when modal closes to get updates
    if (!isModalOpen) refetch();
  }, [isModalOpen, refetch]);

  // Filter expenses based on active filter
  const filteredExpenses = data.filter(expense => {
    if (activeFilter === 'all') return true;
    
    const status = String(expense.status || '').toLowerCase();
    switch (activeFilter) {
      case 'approved':
        return /approved/.test(status);
      case 'pending':
        return /(wait|pending|submitted)/.test(status);
      case 'rejected':
        return /reject/.test(status);
      default:
        return true;
    }
  });

  // Helper function to get filter button classes
  const getFilterButtonClass = (filterType) => {
    const baseClass = "px-3 py-1 rounded text-sm cursor-pointer transition-all duration-200 hover:shadow-sm";
    const isActive = activeFilter === filterType;
    
    switch (filterType) {
      case 'approved':
        return `${baseClass} ${isActive ? 'bg-emerald-500 text-white shadow-md' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`;
      case 'pending':
        return `${baseClass} ${isActive ? 'bg-yellow-500 text-white shadow-md' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`;
      case 'rejected':
        return `${baseClass} ${isActive ? 'bg-red-500 text-white shadow-md' : 'bg-red-100 text-red-800 hover:bg-red-200'}`;
      case 'all':
        return `${baseClass} ${isActive ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`;
      default:
        return baseClass;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user?.name || 'Employee'}</h1>
          <p className="text-sm text-gray-500">Here are your recent expense submissions</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openUpload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded shadow-sm hover:shadow transition"
          >
            <Upload className="w-4 h-4" /> Upload receipt
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded shadow hover:bg-emerald-600 transition"
          >
            <Plus className="w-4 h-4" /> New expense
          </button>
        </div>
      </div>

      {/* Interactive Status Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter by status:</span>
          <button
            onClick={() => setActiveFilter('all')}
            className={getFilterButtonClass('all')}
          >
            All ({data.length})
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={getFilterButtonClass('approved')}
          >
            Approved ({data.filter(e => /approved/i.test(e.status)).length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={getFilterButtonClass('pending')}
          >
            Pending ({data.filter(e => /(wait|pending|submitted)/i.test(e.status)).length})
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={getFilterButtonClass('rejected')}
          >
            Rejected ({data.filter(e => /reject/i.test(e.status)).length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid by</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">No expenses yet</td>
              </tr>
            ) : filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">
                  No expenses found for the selected filter
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onRowClick(exp)}>
                  <td className="px-4 py-3 text-sm text-gray-700">{exp.employee_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{exp.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{exp.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{exp.paid_by}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right">{exp.amount} {exp.currency}</td>
                  <td className="px-4 py-3 text-sm">
                    {/* Map various backend status strings to a visual badge */}
                    {(() => {
                      const s = String(exp.status || '').toLowerCase();
                      if (/approved/.test(s)) {
                        return <span className="px-2 py-1 rounded text-xs bg-emerald-100 text-emerald-800">Approved</span>;
                      }
                      if (/reject/.test(s)) {
                        return <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Rejected</span>;
                      }
                      if (/(wait|pending|submitted)/.test(s)) {
                        return <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">Pending</span>;
                      }
                      // Draft or unknown
                      return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{exp.status || 'Unknown'}</span>;
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReceiptUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onParsed={(parsed) => {
          // keep the parsed data and open the full expense modal prefilled
          setOcrPrefill(parsed);
          setIsUploadOpen(false);
          setSelectedExpense(null);
          setIsModalOpen(true);
        }}
      />

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setOcrPrefill(null); }}
        expense={selectedExpense}
        prefill={ocrPrefill}
      />
    </div>
  );
};

export default Dashboard;
