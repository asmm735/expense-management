import React, { useState } from 'react';
import { Paperclip } from 'lucide-react';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import api from '../api';

const ReceiptUploadModal = ({ isOpen, onClose, onParsed }) => {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const runOCR = async (file) => {
    try {
      setOcrLoading(true);
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      // Simple heuristics
      const amountMatch = text.match(/\d+[.,]?\d{0,2}/g);
      const amount = amountMatch ? amountMatch[amountMatch.length - 1] : '';
      const dateMatch = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
      const date = dateMatch ? dateMatch[0] : '';
      const description = (text.split('\n') || []).slice(0,3).join(' ').trim();
      const currency = (text.match(/\bUSD\b|\bEUR\b|\bGBP\b|\$|€|£/) || [''])[0];
      const parsed = { description, amount, date, currency };
      setPreview(parsed);
      toast.success('OCR parsed the receipt');

      // Auto-submit the expense immediately with receipt attached
      try {
        const form = new FormData();
        form.append('description', parsed.description || '');
        form.append('amount', parsed.amount || '0');
        form.append('date', parsed.date || new Date().toISOString());
        form.append('currency', parsed.currency || 'USD');
        form.append('status', 'Waiting approval');
        form.append('remarks', 'Submitted via receipt upload');
        form.append('receipt', file);

        const res = await api.post('/expenses', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Expense submitted for approval');
        if (onParsed) onParsed(res.data); // pass submitted expense back
        // close modal after submission
        onClose();
      } catch (err) {
        console.error('Auto-submit failed', err);
        toast.error(err?.response?.data?.detail || 'Failed to auto-submit expense');
      }
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
    // show local preview URL
    try {
      const url = URL.createObjectURL(file);
      setPreview((p) => ({ ...p, fileUrl: url }));
    } catch (err) {
      // ignore
    }
    await runOCR(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-white rounded shadow-lg max-w-lg w-full z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">Upload receipt</h3>
          <button onClick={onClose} className="text-gray-600 px-2">Close</button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Select receipt file</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center px-3 py-2 border rounded cursor-pointer bg-gray-50">
              <Paperclip className="mr-2" />
              <span className="text-sm">Choose file</span>
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onFileChange} />
            </label>
            {ocrLoading && <div className="text-sm text-gray-500">Parsing receipt...</div>}
          </div>

          {preview && (
            <div className="border rounded p-3 bg-gray-50">
              <div className="text-sm text-gray-600">Preview</div>
              <div className="mt-2 text-sm text-gray-800">
                <div><strong>Description:</strong> {preview.description}</div>
                <div><strong>Amount:</strong> {preview.amount} {preview.currency}</div>
                <div><strong>Date:</strong> {preview.date}</div>
              </div>
              {preview.fileUrl && (
                <div className="mt-3">
                  <img src={preview.fileUrl} alt="receipt" className="max-h-40 object-contain" />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded">Close</button>
            <button
              onClick={() => { if (onParsed && preview) onParsed(preview); onClose(); }}
              disabled={!preview}
              className="px-4 py-2 bg-emerald-500 text-white rounded disabled:opacity-50"
            >
              Continue to New expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUploadModal;
