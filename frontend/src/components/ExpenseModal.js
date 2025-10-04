import React, { useState, useRef, useEffect } from 'react';
import { X, Paperclip } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useForm } from 'react-hook-form';
import api from '../api';
import toast from 'react-hot-toast';

const ExpenseModal = ({ isOpen, onClose, expense, prefill }) => {
  const { register, handleSubmit, setValue, reset } = useForm({ defaultValues: expense || {} });
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileRef = useRef();

  const runOCR = async (file) => {
    try {
      setOcrLoading(true);
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      // Basic heuristics: look for amounts and dates
      const amountMatch = text.match(/\d+[.,]?\d{0,2}/g);
      if (amountMatch) {
        setValue('amount', amountMatch[amountMatch.length - 1]);
      }
      const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
      if (dateMatch) setValue('date', dateMatch[0]);
      setValue('description', (text.split('\n') || []).slice(0,2).join(' '));
    } catch (err) {
      console.error(err);
      toast.error('OCR failed to parse the receipt');
    } finally {
      setOcrLoading(false);
    }
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // run OCR on the file
    await runOCR(file);
  };

  useEffect(() => {
    // Reset form when expense prop changes
    if (expense) {
      reset(expense);
    }
    // Apply OCR prefill if provided (only when creating new expense)
    if (!expense && prefill) {
      reset({
        description: prefill.description || '',
        amount: prefill.amount || '',
        date: prefill.date || '',
        currency: prefill.currency || 'USD',
        category: '',
        paid_by: '',
        remarks: '',
      });
    }
  }, [expense, prefill, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Normalize payload
      const payload = {
        ...data,
        amount: data.amount ? parseFloat(data.amount) : 0,
        date: data.date ? new Date(data.date).toISOString() : null,
      };

      // If there's an attached file, use FormData
      const file = fileRef.current?.files?.[0];
      // Always submit as 'Waiting approval' for new expenses (single-step)
      if (!expense) payload.status = 'Waiting approval';

      if (file) {
        const form = new FormData();
        Object.keys(payload).forEach((key) => {
          if (payload[key] !== undefined && payload[key] !== null) {
            form.append(key, payload[key]);
          }
        });
        form.append('receipt', file);

        const config = {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // You can set a progress state here if you want to show a progress bar
            console.debug('Upload progress', percentCompleted);
          },
        };

        if (expense) {
          await api.put(`/expenses/${expense.id}`, form, config);
          toast.success('Expense updated');
        } else {
          await api.post('/expenses', form, config);
          toast.success('Expense submitted for approval');
        }
      } else {
        if (expense) {
          await api.put(`/expenses/${expense.id}`, payload);
          toast.success('Expense updated');
        } else {
          await api.post('/expenses', payload);
          toast.success('Expense submitted for approval');
        }
      }
      onClose();
    } catch (err) {
      console.error('Save expense error', err);
      // Try to find a useful message from the server
      const message = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to save expense';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const submitForApproval = async () => {
    setLoading(true);
    try {
      if (!expense) {
        toast.error('Please save the expense before submitting');
        return;
      }
      await api.put(`/expenses/${expense.id}`, { ...expense, status: 'Waiting approval' });
      toast.success('Submitted for approval');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit for approval');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isOpen ? 'fixed inset-0 z-50 flex items-center justify-center' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded shadow-lg max-w-2xl w-full z-10">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium">{expense ? 'Expense details' : 'New expense'}</h3>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-800"><X /></button>
        </div>

        <form className="p-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" className="input-field w-full" {...register('description')} />
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input type="text" className="input-field w-full" {...register('category')} />
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Expense Date</label>
              <input type="date" className="input-field" {...register('date')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Paid by</label>
              <input type="text" className="input-field" {...register('paid_by')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="flex">
                <input type="number" step="0.01" className="input-field" {...register('amount')} />
                <select className="input-field w-28 ml-2" {...register('currency')}>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Remarks</label>
            <textarea className="input-field w-full" rows={3} {...register('remarks')} />
          </div>

          <div className="flex items-start gap-4">
            <label className="inline-flex items-center px-3 py-2 border rounded cursor-pointer bg-gray-50">
              <Paperclip className="mr-2" />
              <span className="text-sm">Attach receipt</span>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onFileChange} />
            </label>

            {ocrLoading && <span className="text-sm text-gray-500">Parsing receipt...</span>}

            <div className="ml-auto flex items-center gap-2">
              <button type="button" onClick={() => onClose()} className="px-4 py-2 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded">{loading ? 'Saving...' : expense ? 'Update' : 'Submit'}</button>
            </div>
          </div>
        </form>

        {expense && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="font-medium">{expense.status}</div>
              </div>
              <div className="ml-4 flex-1">
                <div className="text-sm text-gray-600">Approval history</div>
                <div className="mt-2 space-y-2 text-sm text-gray-700">
                  {(expense.approval_history && expense.approval_history.length > 0) ? (
                    expense.approval_history.map((h, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>{h.approver_name} — {h.action}</div>
                        <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No approval activity yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExpenseModal;
