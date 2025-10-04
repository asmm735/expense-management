import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { useAuth } from "../../context/AuthContext";
import {
  Plus,
  Trash,
  Upload,
  Scan,
  LogOut,
  ArrowLeft,
  DollarSign
} from "lucide-react";
import {
  submitExpense,
  uploadReceipt,
  processOCR,
  convertCurrency,
} from "../../api/employee";

export default function SubmitExpense() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    currency: "USD",
    lineItems: [{ description: "", amount: "" }],
    receipt: null,
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const submitMutation = useMutation({
    mutationFn: submitExpense,
    onSuccess: () => {
      queryClient.invalidateQueries(["employee-stats"]);
      queryClient.invalidateQueries(["employee-expenses"]);
      toast.success('Expense submitted successfully!');
      navigate("/employee/dashboard");
    },
    onError: () => {
      toast.error('Failed to submit expense. Please try again.');
    }
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Signed out successfully');
  };

  // Handle receipt upload and OCR
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setReceiptFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrProcessing(true);

    try {
      // Upload receipt
      const uploadResponse = await uploadReceipt(file);
      toast.success('Receipt uploaded successfully');
      
      // Process OCR
      const ocrData = await processOCR(uploadResponse.fileId);

      // Auto-fill form with OCR data
      if (ocrData) {
        setFormData({
          ...formData,
          category: ocrData.category || formData.category,
          description: ocrData.description || formData.description,
          date: ocrData.date || formData.date,
          currency: ocrData.currency || formData.currency,
          lineItems: ocrData.lineItems?.length > 0 
            ? ocrData.lineItems 
            : formData.lineItems,
          receipt: uploadResponse.fileId,
        });
        toast.success('Receipt processed! Form auto-filled with OCR data.');
      }
    } catch (error) {
      console.error("OCR processing failed:", error);
      toast.error('OCR processing failed. Please fill in details manually.');
    } finally {
      setOcrProcessing(false);
    }
  };

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, { description: "", amount: "" }],
    });
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length > 1) {
      setFormData({
        ...formData,
        lineItems: formData.lineItems.filter((_, i) => i !== index),
      });
    }
  };

  const updateLineItem = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index][field] = value;
    setFormData({ ...formData, lineItems: newLineItems });
  };

  const calculateTotal = () => {
    return formData.lineItems
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
      .toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (formData.lineItems.some(item => !item.description || !item.amount)) {
      toast.error('Please fill in all line item details');
      return;
    }

    const totalAmount = calculateTotal();
    if (parseFloat(totalAmount) === 0) {
      toast.error('Total amount must be greater than 0');
      return;
    }
    
    const expenseData = {
      ...formData,
      totalAmount: totalAmount,
    };

    submitMutation.mutate(expenseData);
  };

  const removeReceipt = () => {
    setPreviewUrl(null);
    setReceiptFile(null);
    setFormData({ ...formData, receipt: null });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/employee/dashboard"
            className="flex items-center gap-2 text-sm text-emerald-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submit Expense</h1>
            <p className="mt-2 text-sm text-gray-600">
              Upload receipt for auto-fill with OCR or enter details manually
            </p>
          </div>
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
        {/* Receipt Upload Section */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Receipt Upload
            </h2>
            
            {!previewUrl ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-emerald-400 transition-colors">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <label className="mt-4 block cursor-pointer">
                  <span className="text-sm text-emerald-600 hover:underline font-medium">
                    Click to upload receipt
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleReceiptUpload}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG, PDF up to 10MB
                </p>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="w-full rounded-lg border max-h-64 object-cover"
                  />
                  <button
                    onClick={removeReceipt}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {receiptFile?.name}
                </p>
              </div>
            )}

            {ocrProcessing && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                <Scan className="h-5 w-5 animate-pulse" />
                <span>Processing OCR...</span>
              </div>
            )}

            {previewUrl && !ocrProcessing && (
              <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Receipt uploaded and processed with OCR
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
            <h3 className="font-semibold flex items-center gap-2">
              <Scan className="h-4 w-4" />
              OCR Auto-Fill
            </h3>
            <p className="mt-1 text-xs text-emerald-700">
              Upload a receipt and the system will automatically extract:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-emerald-700 ml-4">
              <li>• Amount & Currency</li>
              <li>• Vendor/Restaurant name</li>
              <li>• Date</li>
              <li>• Line items</li>
              <li>• Description</li>
            </ul>
          </div>
        </div>

        {/* Expense Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Expense Details
            </h2>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select Category</option>
                  <option value="Travel">Travel</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date and Currency */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    required
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Can be different from company currency
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Add notes about this expense..."
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Expense Line Items *
                  </label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Add Line Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.lineItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) =>
                          updateLineItem(index, "description", e.target.value)
                        }
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        placeholder="Amount"
                        value={item.amount}
                        onChange={(e) =>
                          updateLineItem(index, "amount", e.target.value)
                        }
                        className="w-32 rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      {formData.lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end rounded-lg bg-emerald-50 p-4">
                  <div className="text-right">
                    <p className="text-sm text-emerald-600 font-medium">Total Amount</p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {formData.currency} {calculateTotal()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t pt-6">
                <Link
                  to="/employee/dashboard"
                  className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitMutation.isLoading}
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {submitMutation.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Expense'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}