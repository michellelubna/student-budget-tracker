import React from 'react';
import {
  Calendar,
  Check,
  CreditCard,
  GraduationCap,
  Plus,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { RecurringBill } from '../types/budget';

interface RecurringCommitmentsProps {
  recurringBills: RecurringBill[];
  currentDay: number;
  totalMonthlyRecurring: number;
  onToggleAutoPay: (id: string) => void;
  onViewAll?: () => void;
  onAddRecurring?: () => void;
}

export const RecurringCommitments: React.FC<RecurringCommitmentsProps> = ({
  recurringBills,
  currentDay,
  totalMonthlyRecurring,
  onToggleAutoPay,
  onViewAll,
  onAddRecurring,
}) => {
  // Sort by upcoming day in current cycle
  const sortedBills = [...recurringBills].sort((a, b) => {
    const aDueSoon = a.dueDay >= currentDay;
    const bDueSoon = b.dueDay >= currentDay;
    if (aDueSoon && !bDueSoon) return -1;
    if (!aDueSoon && bDueSoon) return 1;
    return a.dueDay - b.dueDay;
  });

  return (
    <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8B949E]">
              Recurring Commitments
            </h2>
            <span className="text-[10px] font-mono text-[#6E7681]">
              (${totalMonthlyRecurring.toFixed(2)}/mo)
            </span>
          </div>
          <p className="text-[11px] text-[#6E7681] mt-0.5">
            Fixed student costs & shared utilities
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] font-medium text-[#A9CBE5] hover:text-[#FFFFFF] flex items-center gap-1 transition-colors"
          >
            All Bills
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {sortedBills.map((bill) => {
          const isPastThisMonth = bill.dueDay < currentDay;
          const daysAway = bill.dueDay >= currentDay ? bill.dueDay - currentDay : 31 - currentDay + bill.dueDay;

          return (
            <div
              key={bill.id}
              className={`p-3 rounded-[4px] border transition-colors ${
                isPastThisMonth
                  ? 'bg-[#161A1E] border-[#21262D] opacity-75'
                  : 'bg-[#1D2228] border-[#30363D] hover:border-[#42474C]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-[#E6EDF3] tracking-tight">
                      {bill.name}
                    </span>
                    {bill.studentDiscount && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-[2px] text-[9px] bg-[#4A6B82]/20 text-[#A9CBE5] border border-[#4A6B82]/30"
                        title="Active student discount applied"
                      >
                        <GraduationCap className="w-2.5 h-2.5" />
                        Student
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-[#8B949E]">
                    <span className="font-mono tabular-nums">
                      Due Day {bill.dueDay}
                    </span>
                    <span>•</span>
                    <span className={daysAway <= 3 && !isPastThisMonth ? 'text-[#D2BA93] font-medium' : ''}>
                      {isPastThisMonth ? 'Billed for Oct' : `In ${daysAway} day${daysAway === 1 ? '' : 's'}`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-medium text-[#E6EDF3] tabular-nums">
                    ${bill.amount.toFixed(2)}
                  </div>
                  <button
                    onClick={() => onToggleAutoPay(bill.id)}
                    className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
                    title="Toggle auto-pay status"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-[2px] border flex items-center justify-center ${
                        bill.isAutoPay
                          ? 'bg-[#4A6B82] border-[#4A6B82] text-white'
                          : 'border-[#4A6B82] bg-transparent'
                      }`}
                    >
                      {bill.isAutoPay && <Check className="w-2 h-2" />}
                    </span>
                    <span>Auto-pay</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onAddRecurring && (
        <button
          onClick={onAddRecurring}
          className="w-full py-1.5 text-xs text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#22272E] border border-dashed border-[#30363D] rounded-[4px] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Recurring Bill</span>
        </button>
      )}
    </div>
  );
};
