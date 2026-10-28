import React, { useState } from 'react';
import { X, Users, DollarSign, Split } from 'lucide-react';
import { RoommateSplitBalance } from '../types/budget';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSplit: (name: string, totalAmount: number, description: string, splitCount: number) => void;
  roommates: RoommateSplitBalance[];
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  onConfirmSplit,
  roommates,
}) => {
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoommate, setSelectedRoommate] = useState(roommates[0]?.name || 'Alex Rivera');
  const [splitCount, setSplitCount] = useState<number>(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0 || !description.trim()) return;

    onConfirmSplit(selectedRoommate, amount, description.trim(), splitCount);
    setTotalAmount('');
    setDescription('');
    onClose();
  };

  const amountNum = parseFloat(totalAmount) || 0;
  const eachShare = splitCount > 0 ? amountNum / splitCount : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-[#272D35] border border-white/10 rounded-xl w-full max-w-md shadow-[0_8px_24px_rgba(0,0,0,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#1A1E23] border border-[#30363D] flex items-center justify-center text-[#A9CBE5]">
              <Users className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-[#E6EDF3] tracking-tight">
              Split Shared Expense
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#323538]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              Total Receipt Amount ($) *
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
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-lg font-mono font-semibold pl-8 pr-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82] tabular-nums"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
              Expense Item / Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Costco bulk groceries, Wi-Fi bill, Cleaning supplies"
              className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Split With
              </label>
              <select
                value={selectedRoommate}
                onChange={(e) => setSelectedRoommate(e.target.value)}
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
              >
                {roommates.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#8B949E] mb-1">
                Split Distribution
              </label>
              <select
                value={splitCount}
                onChange={(e) => setSplitCount(parseInt(e.target.value, 10))}
                className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] text-xs px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
              >
                <option value={2}>50% / 50% (2 people)</option>
                <option value={3}>1/3rd each (3 roommates)</option>
                <option value={4}>1/4th each (4 roommates)</option>
              </select>
            </div>
          </div>

          {/* Computational breakdown preview */}
          {amountNum > 0 && (
            <div className="p-3 bg-[#1D2228] border border-[#30363D] rounded-[4px] space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-[#8B949E]">
                <span>Total Paid Upfront:</span>
                <span className="tabular-nums text-[#E6EDF3]">${amountNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8B949E]">
                <span>Your Net Share:</span>
                <span className="tabular-nums text-[#E6EDF3]">${eachShare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#A9CBE5] font-semibold border-t border-[#30363D] pt-1">
                <span>{selectedRoommate} will owe you:</span>
                <span className="tabular-nums">
                  +${(amountNum - eachShare).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[#30363D] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-[4px] bg-transparent text-[#E6EDF3] border border-[#30363D] hover:bg-[#22272E] text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98] text-xs font-medium"
            >
              Post to Split Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
