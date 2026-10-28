import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  ArrowRight,
  Plus,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { RoommateSplitBalance } from '../types/budget';

interface SharedSplitsProps {
  roommates: RoommateSplitBalance[];
  totalOwedToUser: number;
  totalUserOwes: number;
  netRoommateBalance: number;
  onSettle: (roommateId: string) => void;
  onOpenSplitModal: () => void;
  onViewAll?: () => void;
}

export const SharedSplits: React.FC<SharedSplitsProps> = ({
  roommates,
  totalOwedToUser,
  totalUserOwes,
  netRoommateBalance,
  onSettle,
  onOpenSplitModal,
  onViewAll,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyBreakdown = (rm: RoommateSplitBalance) => {
    const text = `Hey ${rm.name}, quick Apt 4B ledger update: current balance is $${Math.abs(rm.balance).toFixed(
      2
    )} (${rm.balance > 0 ? 'owed' : 'credit'}). Pending items:\n${rm.pendingItems.map((item) => `- ${item}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedId(rm.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8B949E]">
              Shared Roommate Splits
            </h2>
          </div>
          <p className="text-[11px] text-[#6E7681] mt-0.5">
            Apt 4B utilities & joint grocery ledger
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] font-medium text-[#A9CBE5] hover:text-[#FFFFFF] flex items-center gap-1 transition-colors"
          >
            All Splits
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Net summary strip */}
      <div className="p-3 bg-[#161A1E] border border-[#21262D] rounded-[4px] flex items-center justify-between text-xs">
        <span className="text-[#8B949E]">Net Apartment Position</span>
        <div className="text-right">
          <span
            className={`font-mono font-semibold tabular-nums text-sm ${
              netRoommateBalance >= 0 ? 'text-[#A9CBE5]' : 'text-[#FFB4AB]'
            }`}
          >
            {netRoommateBalance >= 0 ? '+' : '-'}${Math.abs(netRoommateBalance).toFixed(2)}
          </span>
          <div className="text-[10px] text-[#6E7681]">
            {netRoommateBalance >= 0 ? 'Owed to you' : 'You owe group'}
          </div>
        </div>
      </div>

      {/* Roommates list */}
      <div className="space-y-2.5">
        {roommates.map((rm) => {
          const isOwed = rm.balance > 0;
          const isBalanced = rm.balance === 0;

          return (
            <div
              key={rm.id}
              className="p-3 rounded-[4px] bg-[#1D2228] border border-[#30363D] hover:border-[#42474C] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-[4px] bg-[#22272E] border border-[#30363D] flex items-center justify-center font-mono text-xs font-medium text-[#A9CBE5]">
                    {rm.avatarInitials}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#E6EDF3]">
                      {rm.name}
                    </div>
                    <div className="text-[10px] text-[#8B949E] mt-0.5">
                      Last: {rm.lastActivity}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-mono font-medium text-xs tabular-nums ${
                      isOwed
                        ? 'text-[#A9CBE5]'
                        : isBalanced
                        ? 'text-[#8B949E]'
                        : 'text-[#FFB4AB]'
                    }`}
                  >
                    {isOwed ? `+$${rm.balance.toFixed(2)}` : isBalanced ? '$0.00' : `-$${Math.abs(rm.balance).toFixed(2)}`}
                  </div>
                  <div className="text-[10px] text-[#6E7681]">
                    {isOwed ? 'owes you' : isBalanced ? 'settled' : 'you owe'}
                  </div>
                </div>
              </div>

              {/* Pending item summary */}
              {rm.pendingItems.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#21262D] text-[11px] text-[#8B949E]">
                  <div className="text-[10px] uppercase font-mono text-[#6E7681] mb-1">
                    Pending ({rm.pendingItems.length}):
                  </div>
                  <p className="truncate text-[11px] text-[#C2C7CD]">
                    {rm.pendingItems[0]}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-2.5 pt-2 border-t border-[#21262D] flex items-center justify-between gap-2">
                <button
                  onClick={() => copyBreakdown(rm)}
                  className="text-[10px] text-[#8B949E] hover:text-[#E6EDF3] flex items-center gap-1 transition-colors"
                  title="Copy breakdown text for messaging"
                >
                  {copiedId === rm.id ? (
                    <>
                      <Check className="w-3 h-3 text-[#A9CBE5]" />
                      <span className="text-[#A9CBE5]">Copied text</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy memo</span>
                    </>
                  )}
                </button>

                {!isBalanced && (
                  <button
                    onClick={() => onSettle(rm.id)}
                    className="text-[10px] px-2 py-0.5 rounded-[3px] bg-transparent hover:bg-[#22272E] text-[#A9CBE5] border border-[#30363D] hover:border-[#4A6B82] transition-colors"
                  >
                    Mark Settled
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onOpenSplitModal}
        className="w-full py-1.5 text-xs text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#22272E] border border-dashed border-[#30363D] rounded-[4px] flex items-center justify-center gap-1.5 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Split Bill With Roommates</span>
      </button>
    </div>
  );
};
