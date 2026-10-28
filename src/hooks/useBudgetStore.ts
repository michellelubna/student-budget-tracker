import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  RecurringBill,
  RoommateSplitBalance,
  Transaction,
  WorkspaceConfig,
} from '../types/budget';
import {
  INITIAL_CATEGORIES,
  INITIAL_RECURRING,
  INITIAL_ROOMMATES,
  INITIAL_TRANSACTIONS,
  INITIAL_WORKSPACE,
} from '../data/mockData';

const STORAGE_KEYS = {
  WORKSPACE: 'utilitarian_budget_workspace_v1',
  CATEGORIES: 'utilitarian_budget_categories_v1',
  TRANSACTIONS: 'utilitarian_budget_transactions_v1',
  RECURRING: 'utilitarian_budget_recurring_v1',
  ROOMMATES: 'utilitarian_budget_roommates_v1',
};

export function useBudgetStore() {
  const [workspace, setWorkspace] = useState<WorkspaceConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WORKSPACE);
      return saved ? JSON.parse(saved) : INITIAL_WORKSPACE;
    } catch {
      return INITIAL_WORKSPACE;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      return saved ? JSON.parse(saved) : INITIAL_RECURRING;
    } catch {
      return INITIAL_RECURRING;
    }
  });

  const [roommates, setRoommates] = useState<RoommateSplitBalance[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOMMATES);
      return saved ? JSON.parse(saved) : INITIAL_ROOMMATES;
    } catch {
      return INITIAL_ROOMMATES;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WORKSPACE, JSON.stringify(workspace));
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringBills));
      localStorage.setItem(STORAGE_KEYS.ROOMMATES, JSON.stringify(roommates));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [workspace, categories, transactions, recurringBills, roommates]);

  // Computational analytics
  const calculations = useMemo(() => {
    // Current date reference (2026-10-27)
    const today = new Date('2026-10-27T12:00:00Z');
    const daysInMonth = 31;
    const currentDay = today.getDate(); // 27
    const daysRemaining = Math.max(1, daysInMonth - currentDay + 1); // 5 days left in Oct (27, 28, 29, 30, 31)

    // Calculate income and expenses for current month
    let totalIncome = 0;
    let grossExpenses = 0;
    let netExpenses = 0; // factoring in roommate shares

    // Per category spent map
    const categorySpentMap: Record<string, number> = {};
    categories.forEach((cat) => {
      categorySpentMap[cat.id] = 0;
    });

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        grossExpenses += tx.amount;
        const myActualShare = tx.split ? tx.split.myShare : tx.amount;
        netExpenses += myActualShare;

        if (categorySpentMap[tx.categoryId] !== undefined) {
          categorySpentMap[tx.categoryId] += myActualShare;
        }
      }
    });

    // Upcoming recurring bills due for remainder of month (after day 27)
    const pendingRecurringThisMonth = recurringBills.filter(
      (b) => b.dueDay >= currentDay && b.dueDay <= daysInMonth
    );
    const pendingRecurringTotal = pendingRecurringThisMonth.reduce(
      (sum, b) => sum + b.amount,
      0
    );

    // Total monthly recurring commitment
    const totalMonthlyRecurring = recurringBills.reduce((acc, b) => {
      if (b.frequency === 'annual') return acc + b.amount / 12;
      return acc + b.amount;
    }, 0);

    // Total allocated across all categories
    const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);

    // Safe-to-spend: Remaining budget cap minus net expenses and pending recurring
    const remainingBudget = Math.max(0, workspace.monthlyBudgetCap - netExpenses);
    const safeToSpend = Math.max(0, remainingBudget - pendingRecurringTotal);
    const dailyPacingAllowance = safeToSpend / daysRemaining;

    // Velocity metrics per category
    const categoryVelocity = categories.map((cat) => {
      const spent = categorySpentMap[cat.id] || 0;
      const ratio = cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0;
      let status: 'normal' | 'warning' | 'breach' = 'normal';
      if (ratio > 100) {
        status = 'breach';
      } else if (ratio >= 85) {
        status = 'warning';
      }

      return {
        ...cat,
        spent,
        remaining: Math.max(0, cat.allocated - spent),
        ratio,
        status,
      };
    });

    // Roommate balance sums
    const totalOwedToUser = roommates
      .filter((r) => r.balance > 0)
      .reduce((sum, r) => sum + r.balance, 0);
    const totalUserOwes = roommates
      .filter((r) => r.balance < 0)
      .reduce((sum, r) => sum + Math.abs(r.balance), 0);
    const netRoommateBalance = totalOwedToUser - totalUserOwes;

    // Daily spending velocity over past days for sparkline
    const dailySpendMap: Record<number, number> = {};
    for (let d = 1; d <= currentDay; d++) {
      dailySpendMap[d] = 0;
    }
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const txDate = new Date(tx.date + 'T12:00:00Z');
        const d = txDate.getDate();
        if (d >= 1 && d <= currentDay) {
          const myShare = tx.split ? tx.split.myShare : tx.amount;
          dailySpendMap[d] = (dailySpendMap[d] || 0) + myShare;
        }
      }
    });

    const sparklineData = Object.entries(dailySpendMap).map(([day, amount]) => ({
      day: parseInt(day, 10),
      amount: Math.round(amount * 100) / 100,
    }));

    return {
      totalIncome,
      grossExpenses,
      netExpenses,
      daysInMonth,
      currentDay,
      daysRemaining,
      totalAllocated,
      remainingBudget,
      safeToSpend,
      dailyPacingAllowance,
      pendingRecurringTotal,
      pendingRecurringThisMonth,
      totalMonthlyRecurring,
      categoryVelocity,
      totalOwedToUser,
      totalUserOwes,
      netRoommateBalance,
      sparklineData,
    };
  }, [categories, transactions, recurringBills, roommates, workspace]);

  // Actions
  const addTransaction = useCallback((newTx: Omit<Transaction, 'id'>) => {
    const id = 'tx-' + Date.now();
    const tx: Transaction = { ...newTx, id };
    setTransactions((prev) => [tx, ...prev]);

    // If there is a roommate split, update their balances
    if (tx.split && tx.split.roommates.length > 0) {
      setRoommates((prev) =>
        prev.map((rm) => {
          const match = tx.split?.roommates.find((r) => r.name === rm.name);
          if (match && !match.isPaid) {
            return {
              ...rm,
              balance: rm.balance + match.share,
              lastActivity: tx.date,
              pendingItems: [
                ...rm.pendingItems,
                `${tx.merchant} share ($${match.share.toFixed(2)})`,
              ],
            };
          }
          return rm;
        })
      );
    }
  }, []);

  const updateTransaction = useCallback((id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateCategoryAllocation = useCallback((id: string, newAllocated: number) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, allocated: newAllocated } : c))
    );
  }, []);

  const toggleRecurringAutoPay = useCallback((id: string) => {
    setRecurringBills((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isAutoPay: !b.isAutoPay } : b))
    );
  }, []);

  const addRecurringBill = useCallback((newBill: Omit<RecurringBill, 'id'>) => {
    const id = 'rec-' + Date.now();
    setRecurringBills((prev) => [...prev, { ...newBill, id }]);
  }, []);

  const deleteRecurringBill = useCallback((id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const settleRoommateBalance = useCallback((roommateId: string) => {
    setRoommates((prev) =>
      prev.map((rm) => {
        if (rm.id === roommateId) {
          return {
            ...rm,
            balance: 0,
            lastActivity: '2026-10-27',
            pendingItems: ['Settled via payment on 2026-10-27'],
          };
        }
        return rm;
      })
    );
  }, []);

  const addRoommateSplit = useCallback(
    (name: string, totalAmount: number, description: string, splitCount: number = 2) => {
      const share = totalAmount / splitCount;
      const txId = 'tx-' + Date.now();
      const newTx: Transaction = {
        id: txId,
        date: '2026-10-27',
        merchant: description,
        amount: totalAmount,
        type: 'expense',
        categoryId: 'cat-housing',
        account: 'checking',
        note: `Split ${splitCount} ways with ${name}`,
        split: {
          totalPaid: totalAmount,
          myShare: share,
          roommates: [
            {
              name,
              share,
              isPaid: false,
              avatarInitials: name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase(),
            },
          ],
          isSettled: false,
        },
      };

      setTransactions((prev) => [newTx, ...prev]);

      setRoommates((prev) => {
        const existing = prev.find((r) => r.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          return prev.map((r) =>
            r.id === existing.id
              ? {
                  ...r,
                  balance: r.balance + share,
                  lastActivity: '2026-10-27',
                  pendingItems: [...r.pendingItems, `${description} ($${share.toFixed(2)})`],
                }
              : r
          );
        } else {
          return [
            ...prev,
            {
              id: 'rm-' + Date.now(),
              name,
              avatarInitials: name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase(),
              balance: share,
              lastActivity: '2026-10-27',
              pendingItems: [`${description} ($${share.toFixed(2)})`],
            },
          ];
        }
      });
    },
    []
  );

  const resetToDemo = useCallback(() => {
    setWorkspace(INITIAL_WORKSPACE);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setRecurringBills(INITIAL_RECURRING);
    setRoommates(INITIAL_ROOMMATES);
    localStorage.clear();
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Date', 'Merchant', 'Type', 'Category', 'Account', 'Amount', 'MyShare', 'Note'];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || t.categoryId;
      const myShare = t.split ? t.split.myShare : t.amount;
      return [
        t.date,
        `"${t.merchant.replace(/"/g, '""')}"`,
        t.type,
        `"${cat}"`,
        t.account,
        t.amount.toFixed(2),
        myShare.toFixed(2),
        `"${(t.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `utilitarian-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transactions, categories]);

  return {
    workspace,
    setWorkspace,
    categories,
    transactions,
    recurringBills,
    roommates,
    calculations,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateCategoryAllocation,
    toggleRecurringAutoPay,
    addRecurringBill,
    deleteRecurringBill,
    settleRoommateBalance,
    addRoommateSplit,
    resetToDemo,
    exportCSV,
  };
}
