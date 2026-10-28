import React, { useState } from 'react';
import {
  Calendar,
  Check,
  CreditCard,
  GraduationCap,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Category, RecurringBill } from '../types/budget';

interface RecurringViewProps {
  recurringBills: RecurringBill[];
  categories: Category[];
  currentDay: number;
  totalMonthlyRecurring: number;
  onToggleAutoPay: (id: string) => void;
  onAddRecurring: (bill: Omit<RecurringBill, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
}

export const RecurringView: React.FC<RecurringViewProps> = ({
  recurringBills,
  categories,
  currentDay,
  totalMonthlyRecurring,
  onToggleAutoPay,
  onAddRecurring,
  onDeleteRecurring,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('1');
  const [category, setCategory] = useState(categories[0]?.id || 'cat-tech');
  const [studentDiscount, setStudentDiscount] = useState(true);
  const [isAutoPay, setIsAutoPay] = useState(true);

  const annualTotal = recurringBills.reduce((sum, b) => {
    if (b.frequency === 'annual') return sum + b.amount;
    return sum + b.amount * 12;
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const day = parseInt(dueDay, 10);
    if (isNaN(numAmount) || numAmount <= 0 || isNaN(day) || !name.trim()) return;

    onAddRecurring({
      name: name.trim(),
      amount: numAmount,
      dueDay: day,
      category,
      isAutoPay,
      frequency: 'monthly',
      studentDiscount,
      lastBilled: '2026-10-' + (day < 10 ? '0' + day : day),
    });

    setName('');
    setAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top metrics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
          <span className="text-xs font-medium text-[#8B949E] uppercase tracking-tight">
            Monthly Recurring Burn
          </span>
          <div className="text-2xl font-semibold text-[#E6EDF3] font-mono tabular-nums mt-1">
            ${totalMonthlyRecurring.toFixed(2)}
          </div>
          <p className="text-[11px] text-[#6E7681] mt-1">
            Fixed monthly baseline commitments
          </p>
        </div>

        <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
          <span className="text-xs font-medium text-[#8B949E] uppercase tracking-tight">
            Annualized Commitment
          </span>
          <div className="text-2xl font-semibold text-[#E6EDF3] font-mono tabular-nums mt-1">
            ${annualTotal.toFixed(2)}
          </div>
          <p className="text-[11px] text-[#6E7681] mt-1">
            All active subscriptions & services
          </p>
        </div>

        <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
          <span className="text-xs font-medium text-[#8B949E] uppercase tracking-tight">
            Student Discount Status
          </span>
          <div className="text-2xl font-semibold text-[#A9CBE5] font-mono tabular-nums mt-1">
            {recurringBills.filter((b) => b.studentDiscount).length} Active
          </div>
          <p className="text-[11px] text-[#8B949E] mt-1">
            Spotify, Copilot, ACM student tiers
          </p>
        </div>
      </div>

      {/* Main commitments table */}
      <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#E6EDF3] tracking-tight">
              Active Recurring Bills & Subscriptions
            </h3>
            <p className="text-[11px] text-[#8B949E]">
              Track renewal dates, auto-pay debits, and student tiers
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98] text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Close Form' : 'Add Recurring Bill'}</span>
          </button>
        </div>

        {/* Add bill form modal / inline panel */}
        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-[#161A1E] border border-[#30363D] rounded-[4px] mb-5 space-y-3 text-xs"
          >
            <h4 className="font-semibold text-[#E6EDF3] text-xs">
              New Recurring Commitment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Service / Provider *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Student Lab, Cloud Storage"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1A1E23] border border-[#30363D] text-[#E6EDF3] px-2.5 py-1.5 rounded-[4px]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1A1E23] border border-[#30363D] text-[#E6EDF3] px-2.5 py-1.5 rounded-[4px] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8B949E] mb-1">
                  Billing Day of Month (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full bg-[#1A1E23] border border-[#30363D] text-[#E6EDF3] px-2.5 py-1.5 rounded-[4px] font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentDiscount}
                  onChange={(e) => setStudentDiscount(e.target.checked)}
                  className="rounded-[2px] border-[#4A6B82] text-[#4A6B82]"
                />
                <span className="text-[#E6EDF3]">Student Discount Tier Applied</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoPay}
                  onChange={(e) => setIsAutoPay(e.target.checked)}
                  className="rounded-[2px] border-[#4A6B82] text-[#4A6B82]"
                />
                <span className="text-[#E6EDF3]">Direct Auto-Debit Active</span>
              </label>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-[#8B949E] hover:text-[#E6EDF3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98]"
                >
                  Save Bill
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363D] text-[10px] uppercase font-semibold text-[#8B949E]">
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Billing Cycle</th>
                <th className="py-2.5 px-3">Student Rate</th>
                <th className="py-2.5 px-3">Auto-Pay</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {recurringBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-[#1E232A] transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[#E6EDF3]">
                      {bill.name}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#8B949E] tabular-nums">
                    Day {bill.dueDay} of month
                  </td>
                  <td className="py-3 px-3">
                    {bill.studentDiscount ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] bg-[#4A6B82]/20 text-[#A9CBE5] border border-[#4A6B82]/30">
                        <GraduationCap className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[#6E7681] text-[11px]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onToggleAutoPay(bill.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#8B949E] hover:text-[#E6EDF3]"
                    >
                      <span
                        className={`w-3 h-3 rounded-[2px] border flex items-center justify-center ${
                          bill.isAutoPay
                            ? 'bg-[#4A6B82] border-[#4A6B82] text-white'
                            : 'border-[#4A6B82]'
                        }`}
                      >
                        {bill.isAutoPay && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>{bill.isAutoPay ? 'Enabled' : 'Manual'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-[#E6EDF3] tabular-nums">
                    ${bill.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onDeleteRecurring(bill.id)}
                      className="p-1 text-[#8B949E] hover:text-[#F87171] rounded-[2px] hover:bg-[#272D35]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
