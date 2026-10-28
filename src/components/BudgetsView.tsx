import React, { useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  PieChart,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { Category, WorkspaceConfig } from '../types/budget';

interface CategoryVelocityItem extends Category {
  spent: number;
  remaining: number;
  ratio: number;
  status: 'normal' | 'warning' | 'breach';
}

interface BudgetsViewProps {
  categories: CategoryVelocityItem[];
  workspace: WorkspaceConfig;
  onUpdateAllocation: (id: string, newAllocated: number) => void;
  daysRemaining: number;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  categories,
  workspace,
  onUpdateAllocation,
  daysRemaining,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const unallocatedBuffer = workspace.monthlyBudgetCap - totalAllocated;

  const handleStartEdit = (cat: CategoryVelocityItem) => {
    setEditingId(cat.id);
    setEditValue(cat.allocated.toString());
  };

  const handleSaveEdit = (catId: string) => {
    const val = parseFloat(editValue);
    if (!isNaN(val) && val >= 0) {
      onUpdateAllocation(catId, val);
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
          <span className="text-xs font-medium text-[#8B949E] uppercase tracking-tight">
            Monthly Target Cap
          </span>
          <div className="text-2xl font-semibold text-[#E6EDF3] font-mono tabular-nums mt-1">
            ${workspace.monthlyBudgetCap.toFixed(2)}
          </div>
          <p className="text-[11px] text-[#6E7681] mt-1">
            Calibrated for stipend & work-study ceiling
          </p>
        </div>

        <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
          <span className="text-xs font-medium text-[#8B949E] uppercase tracking-tight">
            Total Envelope Allocations
          </span>
          <div className="text-2xl font-semibold text-[#E6EDF3] font-mono tabular-nums mt-1">
            ${totalAllocated.toFixed(2)}
          </div>
          <p className="text-[11px] text-[#6E7681] mt-1">
            {unallocatedBuffer >= 0 ? (
              <span className="text-[#A9CBE5] font-mono">
                +${unallocatedBuffer.toFixed(2)} unassigned buffer
              </span>
            ) : (
              <span className="text-[#FFB4AB] font-mono">
                -${Math.abs(unallocatedBuffer).toFixed(2)} over-budgeted
              </span>
            )}
          </p>
        </div>

        <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
          <span className="text-xs font-medium text-[#8B949E] uppercase tracking-tight">
            Current Spend Velocity
          </span>
          <div className="text-2xl font-semibold text-[#E6EDF3] font-mono tabular-nums mt-1">
            ${totalSpent.toFixed(2)}
          </div>
          <p className="text-[11px] text-[#8B949E] mt-1 font-mono">
            {((totalSpent / workspace.monthlyBudgetCap) * 100).toFixed(1)}% of total cap used
          </p>
        </div>
      </div>

      {/* Envelope management table */}
      <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#E6EDF3] tracking-tight">
              Envelope Allocations & Velocity Status
            </h3>
            <p className="text-[11px] text-[#8B949E]">
              Click allocation limit to rebalance funds across envelopes
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#8B949E]">
            <span className="w-2 h-2 rounded-[2px] bg-[#4A6B82]" />
            <span>&lt;85% Normal</span>
            <span className="w-2 h-2 rounded-[2px] bg-[#8A785D]" />
            <span>85-100% Caution</span>
            <span className="w-2 h-2 rounded-[2px] bg-[#8C5353]" />
            <span>&gt;100% Breached</span>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;
            let barColor = '#4A6B82';
            if (cat.status === 'breach') barColor = '#8C5353';
            else if (cat.status === 'warning') barColor = '#8A785D';

            const clampedRatio = Math.min(100, Math.max(0, cat.ratio));

            return (
              <div
                key={cat.id}
                className="p-4 bg-[#161A1E] border border-[#21262D] rounded-[4px] hover:border-[#30363D] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#E6EDF3]">
                      {cat.name}
                    </span>
                    {cat.isFixed && (
                      <span className="px-1.5 py-0.2 rounded-[2px] text-[10px] bg-[#22272E] text-[#8B949E] border border-[#30363D]">
                        Fixed
                      </span>
                    )}
                  </div>

                  {/* Allocation amount editor */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-[#8B949E]">
                        Spent: <span className="text-[#E6EDF3] font-mono">${cat.spent.toFixed(2)}</span> of
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono text-[#8B949E]">$</span>
                        <input
                          type="number"
                          step="5"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 bg-[#22272E] border border-[#4A6B82] text-[#E6EDF3] font-mono text-xs px-2 py-1 rounded-[3px] focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(cat.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="px-2 py-1 rounded-[3px] bg-[#4A6B82] text-white text-[11px]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(cat)}
                        title="Click to edit envelope allocation"
                        className="font-mono text-xs font-semibold text-[#E6EDF3] px-2 py-1 bg-[#22272E] hover:bg-[#272D35] border border-[#30363D] rounded-[3px] transition-colors flex items-center gap-1"
                      >
                        ${cat.allocated.toFixed(2)}
                        <span className="text-[10px] text-[#8B949E]">✎</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 6px height 2px radius progress bar */}
                <div className="relative w-full bg-[#22272E] h-[6px] rounded-[2px] overflow-hidden my-2">
                  <div
                    className="h-full rounded-[2px] transition-all duration-300"
                    style={{
                      width: `${clampedRatio}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8B949E] font-mono">
                  <span>
                    {cat.status === 'breach' ? (
                      <span className="text-[#FFB4AB] font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Breached by ${(cat.spent - cat.allocated).toFixed(2)}
                      </span>
                    ) : (
                      <span>${cat.remaining.toFixed(2)} available</span>
                    )}
                  </span>
                  <span>
                    {cat.remaining > 0
                      ? `$${(cat.remaining / daysRemaining).toFixed(2)}/day allowable`
                      : '$0.00/day allowance left'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
