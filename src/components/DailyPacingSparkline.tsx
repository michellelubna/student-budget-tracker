import React from 'react';
import { TrendingUp, AlertCircle, Calendar } from 'lucide-react';

interface DailyPacingSparklineProps {
  sparklineData: { day: number; amount: number }[];
  currentDay: number;
  daysInMonth: number;
  dailyAllowance: number;
  safeToSpend: number;
  daysRemaining: number;
}

export const DailyPacingSparkline: React.FC<DailyPacingSparklineProps> = ({
  sparklineData,
  currentDay,
  daysInMonth,
  dailyAllowance,
  safeToSpend,
  daysRemaining,
}) => {
  const maxAmount = Math.max(80, ...sparklineData.map((d) => d.amount));
  const totalSpentSoFar = sparklineData.reduce((acc, d) => acc + d.amount, 0);
  const averageSpentPerDay = currentDay > 0 ? totalSpentSoFar / currentDay : 0;

  return (
    <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8B949E]">
            Daily Spending Velocity
          </h2>
          <p className="text-[11px] text-[#6E7681] mt-0.5">
            Days 1–{currentDay} burn vs ${dailyAllowance.toFixed(2)}/day target
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-medium text-[#E6EDF3] tabular-nums">
            ${averageSpentPerDay.toFixed(2)}/day avg
          </div>
          <div className="text-[10px] text-[#8B949E]">
            {averageSpentPerDay <= dailyAllowance ? (
              <span className="text-[#A9CBE5]">Pacing Under Target</span>
            ) : (
              <span className="text-[#D2BA93]">Accelerated Burn</span>
            )}
          </div>
        </div>
      </div>

      {/* Analytical sparkline visual chart */}
      <div className="pt-2">
        <div className="relative h-20 w-full flex items-end gap-1 border-b border-[#30363D] pb-1">
          {/* Target pacing benchmark hairline */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-[#4A6B82]/50 pointer-events-none z-10"
            style={{
              bottom: `${Math.min(90, (dailyAllowance / maxAmount) * 100)}%`,
            }}
          >
            <span className="absolute -top-3.5 right-0 text-[9px] font-mono text-[#A9CBE5]/70 bg-[#1A1E23] px-1">
              target: ${dailyAllowance.toFixed(0)}
            </span>
          </div>

          {/* Sparkline day bars */}
          {sparklineData.map((point) => {
            const heightPct = Math.min(100, (point.amount / maxAmount) * 100);
            const isToday = point.day === currentDay;
            const isSpike = point.amount > dailyAllowance * 1.5;

            return (
              <div
                key={point.day}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-1 z-20 bg-[#272D35] border border-[#30363D] text-[10px] font-mono text-[#E6EDF3] px-1.5 py-0.5 rounded-[2px] whitespace-nowrap shadow-lg">
                  Day {point.day}: ${point.amount.toFixed(2)}
                </div>

                <div
                  className={`w-full rounded-t-[1px] transition-all duration-150 ${
                    isToday
                      ? 'bg-[#A9CBE5]'
                      : isSpike
                      ? 'bg-[#8A785D]'
                      : point.amount > 0
                      ? 'bg-[#4A6B82]'
                      : 'bg-[#22272E]'
                  }`}
                  style={{
                    height: `${Math.max(4, heightPct)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Days axis markers */}
        <div className="flex justify-between items-center text-[9px] font-mono text-[#6E7681] pt-1.5">
          <span>Day 1</span>
          <span>Day 10</span>
          <span>Day 20</span>
          <span className="text-[#A9CBE5] font-semibold">Today ({currentDay})</span>
          <span>Day {daysInMonth}</span>
        </div>
      </div>

      {/* Pacing diagnostic */}
      <div className="bg-[#161A1E] border border-[#21262D] rounded-[4px] p-2.5 flex items-center justify-between text-xs">
        <span className="text-[#8B949E]">Safe Run-Rate to Month End:</span>
        <span className="font-mono text-[#E6EDF3] tabular-nums font-medium">
          ${safeToSpend.toFixed(2)} ({daysRemaining} days remaining)
        </span>
      </div>
    </div>
  );
};
