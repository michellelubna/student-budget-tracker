import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { Category, Transaction } from '../types/budget';

interface TransactionLedgerProps {
  transactions: Transaction[];
  categories: Category[];
  onAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currencySymbol?: string;
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  transactions,
  categories,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  currencySymbol = '$',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income' | 'splits'>('all');

  const categoryLookup = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search text match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tx.merchant.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        tx.date.includes(q);

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // Type filter
      if (filterType === 'expense' && tx.type !== 'expense') return false;
      if (filterType === 'income' && tx.type !== 'income') return false;
      if (filterType === 'splits' && !tx.split) return false;

      return true;
    });
  }, [transactions, searchQuery, selectedCategory, filterType]);

  return (
    <div className="bg-[#1A1E23] border border-[#30363D] rounded-lg p-5 flex flex-col gap-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8B949E]">
              Transaction Ledger
            </h2>
            <span className="text-[11px] font-mono text-[#6E7681]">
              ({filteredTransactions.length} entries)
            </span>
          </div>
          <p className="text-[11px] text-[#6E7681] mt-0.5">
            Tabular chronological log • Tabular numerals enabled
          </p>
        </div>

        {/* Search input field strictly matching design system */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6E7681]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant, note, date..."
            className="w-full bg-[#161A1E] border border-[#30363D] text-[#E6EDF3] placeholder-[#6E7681] text-xs pl-8 pr-3 py-1.5 rounded-[4px] focus:outline-none focus:border-[#4A6B82] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#6E7681] hover:text-[#E6EDF3]"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-[#21262D]">
        <div className="flex items-center gap-1.5 flex-nowrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 text-[11px] rounded-[4px] border transition-colors ${
              filterType === 'all'
                ? 'bg-[#4A6B82] text-white border-[#4A6B82]'
                : 'bg-transparent text-[#8B949E] border-[#30363D] hover:bg-[#22272E]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-2 py-0.5 text-[11px] rounded-[4px] border transition-colors ${
              filterType === 'expense'
                ? 'bg-[#4A6B82] text-white border-[#4A6B82]'
                : 'bg-transparent text-[#8B949E] border-[#30363D] hover:bg-[#22272E]'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-2 py-0.5 text-[11px] rounded-[4px] border transition-colors ${
              filterType === 'income'
                ? 'bg-[#4A6B82] text-white border-[#4A6B82]'
                : 'bg-transparent text-[#8B949E] border-[#30363D] hover:bg-[#22272E]'
            }`}
          >
            Stipends/Income
          </button>
          <button
            onClick={() => setFilterType('splits')}
            className={`px-2 py-0.5 text-[11px] rounded-[4px] border transition-colors ${
              filterType === 'splits'
                ? 'bg-[#4A6B82] text-white border-[#4A6B82]'
                : 'bg-transparent text-[#8B949E] border-[#30363D] hover:bg-[#22272E]'
            }`}
          >
            Shared Splits
          </button>
        </div>

        {/* Category selector */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter transactions by category"
          className="bg-[#161A1E] border border-[#30363D] text-[#8B949E] text-[11px] px-2 py-0.5 rounded-[4px] focus:outline-none focus:border-[#4A6B82]"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#30363D] text-[10px] uppercase font-semibold text-[#8B949E]">
              <th className="py-2 px-2 w-20">Date</th>
              <th className="py-2 px-2">Merchant & Description</th>
              <th className="py-2 px-2 hidden md:table-cell">Category</th>
              <th className="py-2 px-2 hidden sm:table-cell">Account</th>
              <th className="py-2 px-2 text-right">Amount</th>
              <th className="py-2 px-2 text-right w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262D]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-[#8B949E]">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                const category = categoryLookup.get(tx.categoryId);
                const isIncome = tx.type === 'income';
                const hasSplit = !!tx.split;

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#1E232A] transition-colors group cursor-default text-xs"
                  >
                    {/* Date */}
                    <td className="py-2.5 px-2 text-[#8B949E] tabular-nums font-mono text-[11px] whitespace-nowrap">
                      {tx.date.slice(5)}
                    </td>

                    {/* Merchant & note */}
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-[#E6EDF3] tracking-tight">
                          {tx.merchant}
                        </span>
                        {hasSplit && tx.split && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-[4px] text-[10px] bg-[#4A6B82]/15 text-[#A9CBE5] border border-[#4A6B82]/30"
                            title={`Total paid: $${tx.split.totalPaid.toFixed(2)}, My share: $${tx.split.myShare.toFixed(2)}`}
                          >
                            <Users className="w-2.5 h-2.5" />
                            Split ({tx.split.roommates.map((r) => r.name.split(' ')[0]).join(', ')})
                          </span>
                        )}
                      </div>
                      {tx.note && (
                        <p className="text-[11px] text-[#6E7681] truncate max-w-xs mt-0.5">
                          {tx.note}
                        </p>
                      )}
                    </td>

                    {/* Category chip */}
                    <td className="py-2.5 px-2 hidden md:table-cell whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-medium bg-[rgba(108,130,153,0.12)] text-[#9FB1C1] border border-[rgba(108,130,153,0.25)]">
                        {category?.name || 'General'}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-2.5 px-2 hidden sm:table-cell text-[#8B949E] capitalize text-[11px] whitespace-nowrap">
                      {tx.account}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-2 text-right whitespace-nowrap">
                      <div
                        className={`tabular-nums font-mono font-medium ${
                          isIncome ? 'text-[#A9CBE5]' : 'text-[#E6EDF3]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {currencySymbol}
                        {tx.amount.toFixed(2)}
                      </div>
                      {hasSplit && tx.split && (
                        <div className="text-[10px] text-[#8B949E] font-mono tabular-nums">
                          Net: {currencySymbol}
                          {tx.split.myShare.toFixed(2)}
                        </div>
                      )}
                    </td>

                    {/* Row quick actions */}
                    <td className="py-2.5 px-2 text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          title="Edit transaction"
                          className="p-1 text-[#8B949E] hover:text-[#E6EDF3] rounded-[2px] hover:bg-[#272D35]"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          title="Delete entry"
                          className="p-1 text-[#8B949E] hover:text-[#F87171] rounded-[2px] hover:bg-[#272D35]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
