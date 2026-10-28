import React, { useState, useEffect } from 'react';
import { X, Users, DollarSign, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import { Category, RoommateSplitBalance, Transaction } from '../types/budget';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction | null;
  categories: Category[];
  roommates: RoommateSplitBalance[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  categories,
  roommates,
}) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('2026-10-27');
  const [account, setAccount] = useState<'checking' | 'credit' | 'cash' | 'savings'>('checking');
  const [note, setNote] = useState('');

  // Split state
  const [enableSplit, setEnableSplit] = useState(false);
  const [splitRoommate, setSplitRoommate] = useState(roommates[0]?.name || 'Alex Rivera');
  const [splitRatio, setSplitRatio] = useState<'50' | '33' | 'custom'>('50');

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setMerchant(editingTransaction.merchant);
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date);
      setAccount(editingTransaction.account);
      setNote(editingTransaction.note || '');

      if (editingTransaction.split) {
        setEnableSplit(true);
        if (editingTransaction.split.roommates.length > 0) {
          setSplitRoommate(editingTransaction.split.roommates[0].name);
        }
      } else {
        setEnableSplit(false);
      }
    } else {
      setType('expense');
      setAmount('');
      setMerchant('');
      setCategoryId(categories[0]?.id || 'cat-groceries');
      setDate('2026-10-27');
      setAccount('checking');
      setNote('');
      setEnableSplit(false);
    }
  }, [editingTransaction, categories, roommates, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (!merchant.trim()) return;

    let splitData: Transaction['split'] | undefined = undefined;
    if (enableSplit && type === 'expense') {
      const splitFraction = splitRatio === '50' ? 0.5 : splitRatio === '33' ? 1 / 3 : 0.5;
      const otherShare = Math.round(numAmount * (1 - splitFraction) * 100) / 100;
      const myShare = Math.round(numAmount * splitFraction * 100) / 100;

      splitData = {
        totalPaid: numAmount,
        myShare,
        roommates: [
          {
            name: splitRoommate,
            share: otherShare,
            isPaid: false,
            avatarInitials: splitRoommate
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase(),
          },
        ],
        isSettled: false,
      };
    }

    onSave({
      date,
      merchant: merchant.trim(),
      amount: numAmount,
      type,
      categoryId: categoryId || categories[0]?.id || 'cat-groceries',
      account,
      note: note.trim() || undefined,
      split: splitData,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-[#272D35] border border-white/10 rounded-xl w-full max-w-lg shadow-[0_8px_24px_rgba(0,0,0,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#E6EDF3] tracking-tight">
              {editingTransaction ? 'Edit Transaction Entry' : 'Log New Transaction'}
            </h3>
            <p className="text-[11px] text-[#8B949E]">
              Precision expense and stipend tracking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#323538] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2 bg-[#161A1E] p-1 rounded-[4px] border border-[#30363D]">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 text-xs font-medium rounded-[3px] transition-colors ${
                type === 'expense'
                  ? 'bg-[#22272E] text-[#E6EDF3] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Expense Debit (-)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 text-xs font-medium rounded-[3px] transition-colors ${
                type === 'income'
                  ? 'bg-[#22272E] text-[#A9CBE5] shadow-xs'
                  : 'text-[#8B949E] hover:text-[#E6EDF3]'
              }`}
            >
              Income / Stipend (+)
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              Amount ($ USD) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-[#8B949E]">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-lg font-mono font-semibold pl-8 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82] tabular-nums"
                autoFocus
              />
            </div>
          </div>

          {/* Merchant / Description */}
          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              Merchant / Description *
            </label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Trader Joe's, Campus Bookstore, Metro Pass..."
              className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
            />
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Account
              </label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value as any)}
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
              >
                <option value="checking">Student Checking</option>
                <option value="credit">Student Credit Card</option>
                <option value="cash">Cash / Meal Points</option>
                <option value="savings">Emergency Savings</option>
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82] font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Note / Memo (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Course tag, receipt ref..."
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
              />
            </div>
          </div>

          {/* Roommate Split Toggle (only for expenses) */}
          {type === 'expense' && (
            <div className="pt-2 border-t border-[#30363D]">
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enableSplit}
                  onChange={(e) => setEnableSplit(e.target.checked)}
                  className="rounded-[2px] border-[#4A6B82] text-[#4A6B82] focus:ring-0 bg-[#161A1E]"
                />
                <span className="text-xs font-medium text-[#E6EDF3] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#A9CBE5]" />
                  Split this cost with a roommate
                </span>
              </label>

              {enableSplit && (
                <div className="p-3 bg-[#1D2228] border border-[#30363D] rounded-[4px] grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] text-[#8B949E] mb-1">
                      Roommate
                    </label>
                    <select
                      value={splitRoommate}
                      onChange={(e) => setSplitRoommate(e.target.value)}
                      className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] text-[11px] px-2 py-1.5 rounded-[4px]"
                    >
                      {roommates.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#8B949E] mb-1">
                      Ratio
                    </label>
                    <select
                      value={splitRatio}
                      onChange={(e) => setSplitRatio(e.target.value as any)}
                      className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] text-[11px] px-2 py-1.5 rounded-[4px]"
                    >
                      <option value="50">Split 50 / 50 (Half)</option>
                      <option value="33">Split 33% (1/3rd)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="pt-3 border-t border-[#30363D] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-[4px] bg-transparent text-[#E6EDF3] border border-[#30363D] hover:bg-[#22272E] text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98] text-xs font-medium transition-colors"
            >
              {editingTransaction ? 'Save Changes' : 'Confirm Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
