'use client';

import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  color: 'red' | 'green' | 'amber' | 'blue' | 'purple' | 'default';
}

const colorMap = {
  red: { border: 'border-l-zamp-red', text: 'text-zamp-red' },
  green: { border: 'border-l-zamp-green', text: 'text-zamp-green' },
  amber: { border: 'border-l-zamp-amber', text: 'text-zamp-amber' },
  blue: { border: 'border-l-zamp-blue', text: 'text-zamp-blue' },
  purple: { border: 'border-l-zamp-purple', text: 'text-zamp-purple' },
  default: { border: 'border-l-zamp-text3', text: 'text-zamp-text' },
};

export default function MetricCard({ label, value, sub, color }: MetricCardProps) {
  const colors = colorMap[color];
  return (
    <div className={cn('bg-zamp-bg2 border border-zamp-border rounded-xl p-4 border-l-[3px]', colors.border)}>
      <div className="text-[10px] text-zamp-text3 uppercase tracking-wider mb-1.5 font-mono">{label}</div>
      <div className={cn('text-2xl font-semibold font-mono', colors.text)}>{value}</div>
      {sub && <div className="text-[11px] text-zamp-text3 mt-1">{sub}</div>}
    </div>
  );
}
