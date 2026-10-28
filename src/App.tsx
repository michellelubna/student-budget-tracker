import React, { useState, useEffect } from 'react';
import { useBudgetStore } from './hooks/useBudgetStore';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { BudgetVelocity } from './components/BudgetVelocity';
import { TransactionLedger } from './components/TransactionLedger';
import { RecurringCommitments } from './components/RecurringCommitments';
import { SharedSplits } from './components/SharedSplits';
import { DailyPacingSparkline } from './components/DailyPacingSparkline';
import { TransactionModal } from './components/TransactionModal';
import { SplitBillModal } from './components/SplitBillModal';
import { BudgetsView } from './components/BudgetsView';
import { SplitsView } from './components/SplitsView';
import { RecurringView } from './components/RecurringView';
import { AuthModal } from './components/AuthModal';
import { Transaction, Category } from './types/budget';
import { Info, ShieldCheck, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function App() {
  const {
    workspace,
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
  } = useBudgetStore();

  const [currentView, setCurrentView] = useState<'dashboard' | 'budgets' | 'splits' | 'recurring'>('dashboard');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Keyboard shortcut: Press 'N' to open new transaction modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        setEditingTx(null);
        setIsTxModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>) => {
    if (editingTx) {
      updateTransaction(editingTx.id, txData);
    } else {
      addTransaction(txData);
    }
  };

  const {
    totalIncome,
    netExpenses,
    daysRemaining,
    currentDay,
    daysInMonth,
    safeToSpend,
    dailyPacingAllowance,
    totalMonthlyRecurring,
    categoryVelocity,
    totalOwedToUser,
    totalUserOwes,
    netRoommateBalance,
    sparklineData,
  } = calculations;

  return (
    <div className="min-h-screen bg-[#111417] text-[#E6EDF3] flex flex-col font-sans selection:bg-[#4A6B82]/40 selection:text-[#FFFFFF]">
      {/* Top Application Header */}
      <Header
        workspace={workspace}
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenNewTx={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onOpenSplitBill={() => setIsSplitModalOpen(true)}
        onExportCSV={exportCSV}
        onResetDemo={resetToDemo}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthModalOpen(true);
        }}
        daysRemaining={daysRemaining}
        dailyAllowance={dailyPacingAllowance}
      />

      {/* Main Container Capped at 1280px */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6">
        {/* Metric Summary Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Safe-to-Spend"
            value={`$${safeToSpend.toFixed(2)}`}
            subValue={`$${dailyPacingAllowance.toFixed(2)}/day available`}
            pillText={`${daysRemaining}d remaining`}
            pillVariant={safeToSpend < 100 ? 'warning' : 'accent'}
            formulaExplanation="Budget Cap - MTD Net Spent - Pending Fixed Bills"
          />

          <MetricCard
            label="Net Spent MTD"
            value={`$${netExpenses.toFixed(2)}`}
            subValue={`Cap: $${workspace.monthlyBudgetCap.toFixed(2)}`}
            pillText={`${((netExpenses / workspace.monthlyBudgetCap) * 100).toFixed(0)}% used`}
            pillVariant={
              netExpenses > workspace.monthlyBudgetCap
                ? 'breach'
                : netExpenses > workspace.monthlyBudgetCap * 0.85
                ? 'warning'
                : 'default'
            }
            formulaExplanation="Actual out-of-pocket costs after roommate share deductions"
          />

          <MetricCard
            label="Academic Inflow"
            value={`$${totalIncome.toFixed(2)}`}
            subValue={`Target: $${workspace.monthlyIncomeTarget.toFixed(2)}`}
            pillText="TA Stipends"
            pillVariant="accent"
            formulaExplanation="Bi-weekly direct payroll and scholarship stipends"
          />

          <MetricCard
            label="Apartment Split Ledger"
            value={`${netRoommateBalance >= 0 ? '+' : '-'}$${Math.abs(netRoommateBalance).toFixed(2)}`}
            subValue={`Owed by Apt 4B: $${totalOwedToUser.toFixed(2)}`}
            pillText={netRoommateBalance >= 0 ? 'Net Asset' : 'Net Payable'}
            pillVariant={netRoommateBalance >= 0 ? 'accent' : 'warning'}
            formulaExplanation="Sum of pending roommate shares for utilities & groceries"
          />
        </div>

        {/* View Routing */}
        {currentView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Column 1: Primary Metrics & Category Velocity (4-col on desktop) */}
            <div className="lg:col-span-4 space-y-5">
              <BudgetVelocity
                categories={categoryVelocity}
                daysRemaining={daysRemaining}
                daysInMonth={daysInMonth}
                currentDay={currentDay}
                onEditCategory={(cat) => {
                  setCurrentView('budgets');
                }}
                onViewAll={() => setCurrentView('budgets')}
              />

              <DailyPacingSparkline
                sparklineData={sparklineData}
                currentDay={currentDay}
                daysInMonth={daysInMonth}
                dailyAllowance={dailyPacingAllowance}
                safeToSpend={safeToSpend}
                daysRemaining={daysRemaining}
              />
            </div>

            {/* Column 2: Transaction Ledger & Table (5-col on desktop) */}
            <div className="lg:col-span-5 space-y-5">
              <TransactionLedger
                transactions={transactions}
                categories={categories}
                onAddTransaction={() => {
                  setEditingTx(null);
                  setIsTxModalOpen(true);
                }}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={deleteTransaction}
                currencySymbol={workspace.currencySymbol}
              />
            </div>

            {/* Column 3: Recurring Commitments & Roommate Splits (3-col on desktop) */}
            <div className="lg:col-span-3 space-y-5">
              <RecurringCommitments
                recurringBills={recurringBills}
                currentDay={currentDay}
                totalMonthlyRecurring={totalMonthlyRecurring}
                onToggleAutoPay={toggleRecurringAutoPay}
                onViewAll={() => setCurrentView('recurring')}
                onAddRecurring={() => setCurrentView('recurring')}
              />

              <SharedSplits
                roommates={roommates}
                totalOwedToUser={totalOwedToUser}
                totalUserOwes={totalUserOwes}
                netRoommateBalance={netRoommateBalance}
                onSettle={settleRoommateBalance}
                onOpenSplitModal={() => setIsSplitModalOpen(true)}
                onViewAll={() => setCurrentView('splits')}
              />
            </div>
          </div>
        )}

        {currentView === 'budgets' && (
          <BudgetsView
            categories={categoryVelocity}
            workspace={workspace}
            onUpdateAllocation={updateCategoryAllocation}
            daysRemaining={daysRemaining}
          />
        )}

        {currentView === 'splits' && (
          <SplitsView
            roommates={roommates}
            transactions={transactions}
            onSettle={settleRoommateBalance}
            onOpenSplitModal={() => setIsSplitModalOpen(true)}
          />
        )}

        {currentView === 'recurring' && (
          <RecurringView
            recurringBills={recurringBills}
            categories={categories}
            currentDay={currentDay}
            totalMonthlyRecurring={totalMonthlyRecurring}
            onToggleAutoPay={toggleRecurringAutoPay}
            onAddRecurring={addRecurringBill}
            onDeleteRecurring={deleteRecurringBill}
          />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-[#30363D] bg-[#111417] py-3 text-[11px] text-[#8B949E]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B82]" />
            <span>Utilitarian Slate Budget v1.0 • Systematic Minimalist Architecture</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span>Layout: 4-col | 5-col | 3-col</span>
            <span>Tabular OpenType active</span>
            <span>Press [N] for new transaction</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        categories={categories}
        roommates={roommates}
      />

      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        onConfirmSplit={addRoommateSplit}
        roommates={roommates}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
