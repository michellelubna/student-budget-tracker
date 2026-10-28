import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  pillText?: string;
  pillVariant?: 'default' | 'warning' | 'breach' | 'accent';
  formulaExplanation?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendDirection = 'neutral',
  pillText,
  pillVariant = 'default',
  formulaExplanation,
}) => {
  const getPillStyles = () => {
    switch (pillVariant) {
      case 'warning':
        return 'bg-[#8A785D]/20 text-[#D2BA93] border-[#8A785D]/40';
      case 'breach':
        return 'bg-[#8C5353]/20 text-[#FFB4AB] border-[#8C5353]/40';
      case 'accent':
        return 'bg-[#4A6B82]/20 text-[#A9CBE5] border-[#4A6B82]/40';
      default:
        return 'bg-[rgba(108,130,153,0.12)] text-[#9FB1C1] border-[rgba(108,130,153,0.25)]';
    }
  };

  return (
    <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-4 sm:p-5 flex flex-col justify-between transition-colors hover:border-[#42474C]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-[#8B949E] tracking-tight uppercase">
            {label}
          </span>
          {pillText && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-[4px] border ${getPillStyles()}`}
            >
              {pillText}
            </span>
          )}
        </div>

        <div className="text-[1.75rem] font-semibold text-[#E6EDF3] tracking-[-0.02em] leading-tight tabular-nums font-mono">
          {value}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#21262D] flex items-center justify-between text-xs">
        <span className="text-[#8B949E]">{subValue}</span>
        {formulaExplanation && (
          <span className="text-[10px] text-[#6E7681] font-mono" title={formulaExplanation}>
            {formulaExplanation}
          </span>
        )}
      </div>
    </div>
  );
};
