// ============================================
// History Component - View past feeding logs
// ============================================

import React from 'react';
import { HistoryEntry, getStepDisplayName, CycleStep } from '../types';

interface HistoryProps {
  history: HistoryEntry[];
  onClear: () => void;
  onClose: () => void;
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Get step icon
 */
function getStepIcon(step: CycleStep): string {
  switch (step) {
    case 'medicine': return '💊';
    case 'feeding': return '🍼';
    case 'burping': return '👶';
    case 'waiting': return '⏰';
    default: return '📋';
  }
}

/**
 * Get step background color
 */
function getStepBgColor(step: CycleStep): string {
  switch (step) {
    case 'medicine': return 'bg-purple-100 dark:bg-purple-900/30';
    case 'feeding': return 'bg-pink-100 dark:bg-pink-900/30';
    case 'burping': return 'bg-blue-100 dark:bg-blue-900/30';
    case 'waiting': return 'bg-amber-100 dark:bg-amber-900/30';
    default: return 'bg-gray-100 dark:bg-gray-800';
  }
}

/**
 * Group entries by date
 */
function groupByDate(entries: HistoryEntry[]): Map<string, HistoryEntry[]> {
  const groups = new Map<string, HistoryEntry[]>();
  
  entries.forEach(entry => {
    const dateKey = new Date(entry.timestamp).toDateString();
    const existing = groups.get(dateKey) || [];
    groups.set(dateKey, [...existing, entry]);
  });
  
  return groups;
}

export const History: React.FC<HistoryProps> = ({
  history,
  onClear,
  onClose,
}) => {
  // Reverse to show newest first
  const reversedHistory = [...history].reverse();
  const groupedHistory = groupByDate(reversedHistory);

  // Stats
  const todayStr = new Date().toDateString();
  const todayEntries = history.filter(
    (e) => new Date(e.timestamp).toDateString() === todayStr
  );
  const feedingsToday = todayEntries.filter((e) => e.step === 'feeding').length;
  const completedToday = todayEntries.filter((e) => e.completed).length;
  const skippedToday = todayEntries.filter((e) => e.skipped).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">📋 History</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white/80 text-sm mt-1">
            View your care history log
          </p>
        </div>

        {/* Today's Stats */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Today's Summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-pink-500">{feedingsToday}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Feedings</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-green-500">{completedToday}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center shadow-sm">
              <p className="text-2xl font-bold text-amber-500">{skippedToday}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Skipped</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="overflow-y-auto max-h-[45vh] p-4">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-4">📭</p>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No history yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Start a cycle to begin logging
              </p>
            </div>
          ) : (
            Array.from(groupedHistory.entries()).map(([dateKey, entries]) => (
              <div key={dateKey} className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {dateKey === todayStr
                    ? 'Today'
                    : dateKey === new Date(Date.now() - 86400000).toDateString()
                    ? 'Yesterday'
                    : new Date(dateKey).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                </h3>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`${getStepBgColor(entry.step)} rounded-xl p-3 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStepIcon(entry.step)}</span>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {getStepDisplayName(entry.step)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Cycle #{entry.cycleNumber} • {formatDate(new Date(entry.timestamp))}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          entry.skipped
                            ? 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                            : 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                        }`}
                      >
                        {entry.skipped ? 'Skipped' : 'Done'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {history.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all history?')) {
                  onClear();
                }
              }}
              className="w-full py-3 px-6 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-md font-semibold rounded-xl transition-all duration-200"
            >
              🗑️ Clear All History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
