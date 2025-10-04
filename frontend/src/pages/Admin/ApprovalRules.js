import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import {
  getApprovalRules,
  createApprovalRule,
  updateApprovalRule,
  deleteApprovalRule,
  getAllUsers,
} from "../../api/admin";

export default function ApprovalRules() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const { data: rules, isLoading } = useQuery({
    queryKey: ["approval-rules"],
    queryFn: getApprovalRules,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });

  const createMutation = useMutation({
    mutationFn: createApprovalRule,
    onSuccess: () => {
      queryClient.invalidateQueries(["approval-rules"]);
      setIsModalOpen(false);
      setEditingRule(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateApprovalRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["approval-rules"]);
      setIsModalOpen(false);
      setEditingRule(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApprovalRule,
    onSuccess: () => {
      queryClient.invalidateQueries(["approval-rules"]);
    },
  });

  const handleOpenModal = (rule = null) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRule(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/admin/dashboard" className="text-sm text-emerald-600 hover:underline mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Approval Rules</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure multi-level approval workflows and conditions
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
        >
          <Plus className="h-5 w-5" />
          Add Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow">
            Loading rules...
          </div>
        ) : rules?.length > 0 ? (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-lg bg-white p-6 shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {rule.name}
                    </h3>
                    {rule.isActive && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{rule.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Rule Type:</span>{" "}
                      <span className="text-gray-600">{rule.type}</span>
                    </div>

                    {rule.type === "sequential" && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Steps:</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {rule.steps?.map((step, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-emerald-50 px-3 py-2 text-xs"
                            >
                              Step {idx + 1}: {step.approverName}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {rule.type === "percentage" && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Required Approval:
                        </span>{" "}
                        <span className="text-gray-600">
                          {rule.percentage}% of approvers
                        </span>
                      </div>
                    )}

                    {rule.type === "specific" && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Specific Approver:
                        </span>{" "}
                        <span className="text-gray-600">
                          {rule.specificApproverName}
                        </span>
                      </div>
                    )}

                    {rule.threshold && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Amount Threshold:
                        </span>{" "}
                        <span className="text-gray-600">
                          {rule.currency} {rule.threshold}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(rule)}
                    className="text-emerald-600 hover:text-emerald-800"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete "${rule.name}"?`
                        )
                      ) {
                        deleteMutation.mutate(rule.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow">
            No approval rules configured
          </div>
        )}
      </div>

      {/* Rule Modal */}
      {isModalOpen && (
        <ApprovalRuleModal
          rule={editingRule}
          users={users}
          onClose={handleCloseModal}
          onSave={(data) => {
            if (editingRule) {
              updateMutation.mutate({ id: editingRule.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      )}
    </div>
  );
}

function ApprovalRuleModal({ rule, users, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: rule?.name || "",
    description: rule?.description || "",
    type: rule?.type || "sequential",
    threshold: rule?.threshold || "",
    currency: rule?.currency || "USD",
    percentage: rule?.percentage || 60,
    specificApproverId: rule?.specificApproverId || "",
    steps: rule?.steps || [],
    isActive: rule?.isActive ?? true,
  });

  const managers = users?.filter((u) => u.isApprover) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { approverId: "", order: formData.steps.length + 1 }],
    });
  };

  const removeStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const updateStep = (index, approverId) => {
    const newSteps = [...formData.steps];
    newSteps[index].approverId = approverId;
    setFormData({ ...formData, steps: newSteps });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {rule ? "Edit Approval Rule" : "Create Approval Rule"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rule Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rule Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="sequential">Sequential Approval</option>
                <option value="percentage">Percentage-Based</option>
                <option value="specific">Specific Approver</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount Threshold (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.threshold}
                onChange={(e) =>
                  setFormData({ ...formData, threshold: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                placeholder="e.g., 1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                placeholder="USD"
              />
            </div>
          </div>

          {formData.type === "sequential" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Steps
              </label>
              <div className="space-y-2">
                {formData.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Step {idx + 1}:</span>
                    <select
                      value={step.approverId}
                      onChange={(e) => updateStep(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Select Approver</option>
                      {managers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStep}
                  className="text-sm text-emerald-600 hover:underline"
                >
                  + Add Step
                </button>
              </div>
            </div>
          )}

          {formData.type === "percentage" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Required Approval Percentage
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({ ...formData, percentage: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {formData.type === "specific" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Specific Approver
              </label>
              <select
                value={formData.specificApproverId}
                onChange={(e) =>
                  setFormData({ ...formData, specificApproverId: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Select Approver</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
              Rule is Active
            </label>
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
              className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
            >
              {rule ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}