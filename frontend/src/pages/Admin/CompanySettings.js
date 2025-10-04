import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Building, DollarSign } from "lucide-react";
import { getCompanySettings, updateCompanySettings } from "../../api/admin";

export default function CompanySettings() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["company-settings"],
    queryFn: getCompanySettings,
  });

  const updateMutation = useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries(["company-settings"]);
      setIsEditing(false);
    },
  });

  const [formData, setFormData] = useState(settings || {});

  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <Link to="/admin/dashboard" className="text-sm text-emerald-600 hover:underline mb-2 block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage company information, default currency, and policies
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow">
          Loading settings...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Company Information */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Company Information
                </h2>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    value={formData.address || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(settings);
                    }}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isLoading}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {updateMutation.isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <InfoRow label="Company Name" value={settings?.name} />
                <InfoRow label="Country" value={settings?.country} />
                <InfoRow label="Address" value={settings?.address} />
                <InfoRow label="Phone" value={settings?.phone} />
                <InfoRow label="Email" value={settings?.email} />
              </div>
            )}
          </div>

          {/* Currency Settings */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Currency Settings
              </h2>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Default Currency
                  </label>
                  <select
                    value={formData.defaultCurrency || "USD"}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultCurrency: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoConvert"
                    checked={formData.autoConvertCurrency || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoConvertCurrency: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="autoConvert" className="ml-2 text-sm text-gray-700">
                    Automatically convert expenses to default currency
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoRow
                  label="Default Currency"
                  value={settings?.defaultCurrency || "USD"}
                />
                <InfoRow
                  label="Auto-convert"
                  value={settings?.autoConvertCurrency ? "Enabled" : "Disabled"}
                />
              </div>
            )}
          </div>

          {/* Policy Settings */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Expense Policies
              </h2>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Expense Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maxExpenseAmount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxExpenseAmount: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g., 10000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expense Categories (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.expenseCategories?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expenseCategories: e.target.value
                          .split(",")
                          .map((c) => c.trim()),
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    placeholder="Travel, Food, Office Supplies, etc."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireReceipt"
                    checked={formData.requireReceipt || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requireReceipt: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="requireReceipt"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Require receipt upload for all expenses
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <InfoRow
                  label="Max Expense Amount"
                  value={
                    settings?.maxExpenseAmount
                      ? `${settings.defaultCurrency} ${settings.maxExpenseAmount}`
                      : "No limit"
                  }
                />
                <InfoRow
                  label="Categories"
                  value={settings?.expenseCategories?.join(", ") || "Not set"}
                />
                <InfoRow
                  label="Receipt Required"
                  value={settings?.requireReceipt ? "Yes" : "No"}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-100 py-2">
      <span className="text-sm font-medium text-gray-700">{label}:</span>
      <span className="text-sm text-gray-900">{value || "—"}</span>
    </div>
  );
}