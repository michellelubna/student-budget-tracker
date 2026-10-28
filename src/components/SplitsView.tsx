import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Plus,
  ArrowRight,
  Receipt,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { RoommateSplitBalance, Transaction } from '../types/budget';

interface SplitsViewProps {
  roommates: RoommateSplitBalance[];
  transactions: Transaction[];
  onSettle: (roommateId: string) => void;
  onOpenSplitModal: () => void;
}

export const SplitsView: React.FC<SplitsViewProps> = ({
  roommates,
  transactions,
  onSettle,
  onOpenSplitModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const splitTransactions = transactions.filter((t) => !!t.split);

  const copyDetailedAudit = (rm: RoommateSplitBalance) => {
    const text = `--- Apt 4B Ledger Audit ---\nRoommate: ${rm.name}\nNet Balance: $${Math.abs(rm.balance).toFixed(2)} (${rm.balance > 0 ? 'owed to you' : 'you owe'})\nRecent Items:\n${rm.pendingItems.map((item) => `• ${item}`).join('\n')}\nAudit generated: 2026-10-27`;
    navigator.clipboard.writeText(text);
    setCopiedId(rm.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
        <div>
          <h2 className="text-sm font-semibold text-[#E6EDF3] tracking-tight uppercase">
            Shared Apartment Splits & Cost Ledger
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5">
            Transparent split balancing for rent, fiber internet, pantry supplies, and groceries
          </p>
        </div>

        <button
          onClick={onOpenSplitModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[4px] bg-[#4A6B82] text-white hover:bg-[#5A7E98] text-xs font-medium self-start sm:self-auto transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Split Expense</span>
        </button>
      </div>

      {/* Roommate Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roommates.map((rm) => {
          const isOwed = rm.balance > 0;
          const isBalanced = rm.balance === 0;

          return (
            <div
              key={rm.id}
              className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[4px] bg-[#22272E] border border-[#30363D] flex items-center justify-center font-mono text-xs font-semibold text-[#A9CBE5]">
                      {rm.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#E6EDF3]">
                        {rm.name}
                      </h3>
                      <span className="text-[10px] text-[#8B949E]">
                        Last activity {rm.lastActivity}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-mono font-semibold tabular-nums ${
                      isOwed
                        ? 'text-[#A9CBE5]'
                        : isBalanced
                        ? 'text-[#8B949E]'
                        : 'text-[#FFB4AB]'
                    }`}
                  >
                    {isOwed ? `+$${rm.balance.toFixed(2)}` : isBalanced ? '$0.00' : `-$${Math.abs(rm.balance).toFixed(2)}`}
                  </span>
                </div>

                <div className="p-2.5 bg-[#161A1E] border border-[#21262D] rounded-[4px] mb-3">
                  <span className="text-[10px] font-mono uppercase text-[#6E7681] block mb-1">
                    Pending Items ({rm.pendingItems.length})
                  </span>
                  <div className="space-y-1">
                    {rm.pendingItems.map((item, idx) => (
                      <div key={idx} className="text-[11px] text-[#C2C7CD] truncate">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#21262D] flex items-center justify-between gap-2">
                <button
                  onClick={() => copyDetailedAudit(rm)}
                  className="text-[11px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors"
                >
                  {copiedId === rm.id ? (
                    <>
                      <Check className="w-3 h-3 text-[#A9CBE5]" />
                      <span className="text-[#A9CBE5]">Copied text</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Audit</span>
                    </>
                  )}
                </button>

                {!isBalanced && (
                  <button
                    onClick={() => onSettle(rm.id)}
                    className="text-xs px-2.5 py-1 rounded-[4px] bg-[#22272E] text-[#A9CBE5] border border-[#30363D] hover:border-[#4A6B82] transition-colors"
                  >
                    Settle Account
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Split transaction history */}
      <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B949E] mb-3">
          Shared Expenses History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363D] text-[10px] uppercase font-semibold text-[#8B949E]">
                <th className="py-2 px-2">Date</th>
                <th className="py-2 px-2">Item Description</th>
                <th className="py-2 px-2">Total Billed</th>
                <th className="py-2 px-2">Your Share</th>
                <th className="py-2 px-2">Shared With</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#21262D]">
              {splitTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1E232A] transition-colors">
                  <td className="py-2.5 px-2 font-mono text-[#8B949E] tabular-nums">
                    {tx.date}
                  </td>
                  <td className="py-2.5 px-2 font-medium text-[#E6EDF3]">
                    {tx.merchant}
                    {tx.note && <span className="block text-[11px] text-[#6E7681]">{tx.note}</span>}
                  </td>
                  <td className="py-2.5 px-2 font-mono tabular-nums text-[#8B949E]">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2 font-mono tabular-nums font-semibold text-[#E6EDF3]">
                    ${tx.split?.myShare.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] bg-[rgba(108,130,153,0.12)] text-[#9FB1C1] border border-[rgba(108,130,153,0.25)]">
                      {tx.split?.roommates.map((r) => r.name).join(', ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-[11px] font-mono text-[#A9CBE5]">
                      Recorded
                    </span>
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
