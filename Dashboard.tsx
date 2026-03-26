// ============================================
// Baby Care Reminder App
// A simple app for premature baby care scheduling
// ============================================

import React, { useState, useEffect } from 'react';
import { Settings as SettingsType, DEFAULT_SETTINGS } from './types';
import { loadSettings, saveSettings } from './utils/storage';
import { useCycleTimer } from './hooks/useCycleTimer';
import { useNotification } from './hooks/useNotification';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { History } from './components/History';

/**
 * Main App Component
 * This is the entry point of the Baby Care Reminder app
 */
const App: React.FC = () => {
  // ==========================================
  // State Management
  // ==========================================

  // Settings state - loaded from localStorage
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);

  // UI state for modals
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  // ==========================================
  // Custom Hooks
  // ==========================================

  // Timer hook for managing the care cycle
  const {
    cycleState,
    remainingTime,
    history,
    startCycle,
    stopCycle,
    skipStep,
    markDone,
    emergencyStart,
    clearHistory,
  } = useCycleTimer(settings);

  // Notification hook
  const { requestPermission } = useNotification(settings);

  // ==========================================
  // Effects
  // ==========================================

  // Load settings on mount
  useEffect(() => {
    const savedSettings = loadSettings();
    setSettings(savedSettings);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Keep screen awake when cycle is running (using wake lock API if available)
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && cycleState.isRunning) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock error:', err);
        }
      }
    };

    if (cycleState.isRunning) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [cycleState.isRunning]);

  // Update document title with timer status
  useEffect(() => {
    if (cycleState.isRunning && remainingTime > 0) {
      const minutes = Math.floor(remainingTime / 60000);
      const seconds = Math.floor((remainingTime % 60000) / 1000);
      document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - Baby Care`;
    } else {
      document.title = 'Baby Care Reminder';
    }
  }, [cycleState.isRunning, remainingTime]);

  // ==========================================
  // Event Handlers
  // ==========================================

  /**
   * Save settings and update state
   */
  const handleSaveSettings = (newSettings: SettingsType) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  /**
   * Request notification permission
   */
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* App Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="text-3xl">👶</span>
                {cycleState.isRunning && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  Baby Care Reminder
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {cycleState.isRunning 
                    ? `🟢 Cycle ${cycleState.cycleNumber} Active`
                    : 'Premature Baby Care Scheduler'}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="View History"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="Settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Permission Banner */}
      {notificationPermission !== 'granted' && (
        <div className="max-w-lg mx-auto px-4 mt-4">
          <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔔</span>
              <div className="flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  Enable Notifications
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Get alerts for each care step so you never miss a feeding time.
                </p>
                <button
                  onClick={handleRequestPermission}
                  className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Dashboard */}
      <main className="max-w-lg mx-auto">
        <Dashboard
          cycleState={cycleState}
          remainingTime={remainingTime}
          onStartCycle={startCycle}
          onStopCycle={stopCycle}
          onSkipStep={skipStep}
          onMarkDone={markDone}
          onEmergencyStart={emergencyStart}
        />

        {/* Quick Info Cards */}
        <div className="px-4 pb-8 grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cycle Duration</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {settings.cycleDuration >= 60 
                ? `${Math.floor(settings.cycleDuration / 60)}h ${settings.cycleDuration % 60}m`
                : `${settings.cycleDuration}m`}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today's Cycles</p>
            <p className="text-xl font-bold text-pink-500">
              {history.filter(h => 
                h.step === 'feeding' && 
                new Date(h.timestamp).toDateString() === new Date().toDateString()
              ).length}
            </p>
          </div>
        </div>

        {/* Cycle Schedule Preview */}
        <div className="px-4 pb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
              📅 Cycle Schedule
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span>💊</span> Medicine
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {settings.medicineTime} min
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span>🍼</span> Feeding
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {settings.feedingDuration} min
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span>👶</span> Burping
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {settings.burpingDuration} min
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span>⏰</span> Wait Time
                </span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {settings.cycleDuration - settings.medicineTime - settings.feedingDuration - settings.burpingDuration} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-8 text-center text-sm text-gray-400 dark:text-gray-500">
        <p>Made with ❤️ for premature baby care</p>
        <p className="mt-1">Keep screen open for best experience</p>
      </footer>

      {/* Modals */}
      {showSettings && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHistory && (
        <History
          history={history}
          onClear={clearHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

export default App;
