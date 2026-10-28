import React from 'react';
import {
  ShoppingBag,
  Home,
  Coffee,
  BookOpen,
  Terminal,
  Train,
  Shield,
  Compass,
  AlertTriangle,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { Category } from '../types/budget';

interface CategoryVelocityItem extends Category {
  spent: number;
  remaining: number;
  ratio: number;
  status: 'normal' | 'warning' | 'breach';
}

interface BudgetVelocityProps {
  categories: CategoryVelocityItem[];
  daysRemaining: number;
  daysInMonth: number;
  currentDay: number;
  onEditCategory?: (category: Category) => void;
  onViewAll?: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBag className="w-3.5 h-3.5" />,
  Home: <Home className="w-3.5 h-3.5" />,
  Coffee: <Coffee className="w-3.5 h-3.5" />,
  BookOpen: <BookOpen className="w-3.5 h-3.5" />,
  Terminal: <Terminal className="w-3.5 h-3.5" />,
  Train: <Train className="w-3.5 h-3.5" />,
  Shield: <Shield className="w-3.5 h-3.5" />,
  Compass: <Compass className="w-3.5 h-3.5" />,
};

export const BudgetVelocity: React.FC<BudgetVelocityProps> = ({
  categories,
  daysRemaining,
  daysInMonth,
  currentDay,
  onEditCategory,
  onViewAll,
}) => {
  const monthProgressRatio = (currentDay / daysInMonth) * 100;

  return (
    <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8B949E]">
            Category Velocity & Envelopes
          </h2>
          <p className="text-[11px] text-[#6E7681] mt-0.5">
            Month {currentDay}/{daysInMonth} ({monthProgressRatio.toFixed(0)}% elapsed)
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[11px] font-medium text-[#A9CBE5] hover:text-[#FFFFFF] flex items-center gap-1 transition-colors"
          >
            Manage Envelopes
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Threshold legend */}
      <div className="flex items-center gap-3 text-[10px] text-[#8B949E] py-1 border-b border-[#21262D]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-[2px] bg-[#4A6B82]" />
          <span>Optimal (&lt;85%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-[2px] bg-[#8A785D]" />
          <span>Caution (85-100%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-[2px] bg-[#8C5353]" />
          <span>Breached (&gt;100%)</span>
        </div>
      </div>

      {/* Category velocity items */}
      <div className="space-y-3.5">
        {categories.map((cat) => {
          const clampedWidth = Math.min(100, Math.max(0, cat.ratio));

          // Color calculation according to design specs:
          // #4A6B82 normal, #8A785D at 85% limit, #8C5353 only upon breach
          let barBg = '#4A6B82';
          let statusBadgeClass =
            'bg-[rgba(108,130,153,0.12)] text-[#9FB1C1] border-[rgba(108,130,153,0.25)]';

          if (cat.status === 'breach') {
            barBg = '#8C5353';
            statusBadgeClass = 'bg-[#8C5353]/15 text-[#FFB4AB] border-[#8C5353]/30';
          } else if (cat.status === 'warning') {
            barBg = '#8A785D';
            statusBadgeClass = 'bg-[#8A785D]/15 text-[#D2BA93] border-[#8A785D]/30';
          }

          return (
            <div
              key={cat.id}
              className="group cursor-pointer"
              onClick={() => onEditCategory && onEditCategory(cat)}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B949E] group-hover:text-[#E6EDF3] transition-colors">
                    {ICON_MAP[cat.iconName] || <ShoppingBag className="w-3.5 h-3.5" />}
                  </span>
                  <span className="font-medium text-[#E6EDF3] tracking-tight">
                    {cat.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="tabular-nums font-mono text-[11px] text-[#8B949E]">
                    ${cat.spent.toFixed(2)} / ${cat.allocated.toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] border ${statusBadgeClass}`}
                  >
                    {cat.ratio.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress track & indicator strictly 6px height with 2px radius */}
              <div className="relative w-full bg-[#22272E] h-[6px] rounded-[2px] overflow-hidden">
                <div
                  className="h-full rounded-[2px] transition-all duration-300"
                  style={{
                    width: `${clampedWidth}%`,
                    backgroundColor: barBg,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#6E7681] mt-1 font-mono">
                <span>
                  {cat.status === 'breach' ? (
                    <span className="text-[#FFB4AB] font-medium flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      Over by ${(cat.spent - cat.allocated).toFixed(2)}
                    </span>
                  ) : (
                    <span>${cat.remaining.toFixed(2)} remaining</span>
                  )}
                </span>
                <span>
                  {cat.remaining > 0
                    ? `$${(cat.remaining / daysRemaining).toFixed(2)}/day`
                    : '$0.00/day'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
