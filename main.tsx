// ============================================
// Custom hook for managing the care cycle timer
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CycleStep, 
  CycleState, 
  Settings, 
  HistoryEntry,
  getNextStep,
  getStepMessage,
  getStepDisplayName,
} from '../types';
import { 
  saveCycleState, 
  loadCycleState, 
  addHistoryEntry,
  loadHistory,
  saveHistory,
} from '../utils/storage';
import { useNotification } from './useNotification';

/**
 * Calculate the duration for each step in milliseconds
 */
function getStepDuration(step: CycleStep, settings: Settings): number {
  switch (step) {
    case 'medicine':
      return settings.medicineTime * 60 * 1000;
    case 'feeding':
      return settings.feedingDuration * 60 * 1000;
    case 'burping':
      return settings.burpingDuration * 60 * 1000;
    case 'waiting':
      // Waiting time = cycle duration - (medicine + feeding + burping)
      const activeTime = settings.medicineTime + settings.feedingDuration + settings.burpingDuration;
      const waitTime = settings.cycleDuration - activeTime;
      return Math.max(waitTime, 1) * 60 * 1000; // At least 1 minute
    default:
      return 0;
  }
}

/**
 * Main hook for managing the baby care cycle
 */
export function useCycleTimer(settings: Settings) {
  // State for the cycle
  const [cycleState, setCycleState] = useState<CycleState>({
    isRunning: false,
    currentStep: 'idle',
    cycleNumber: 0,
    cycleStartTime: null,
    stepStartTime: null,
    stepEndTime: null,
  });

  // State for countdown
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  // State for history
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Notification hook
  const { notify } = useNotification(settings);

  // Interval reference for timer
  const timerRef = useRef<number | null>(null);

  // Flag to track if we've already notified for current step
  const hasNotifiedRef = useRef<boolean>(false);

  /**
   * Load saved state on mount
   */
  useEffect(() => {
    const savedState = loadCycleState();
    if (savedState && savedState.isRunning && savedState.stepEndTime) {
      // Check if the step has ended while app was closed
      const now = new Date();
      const endTime = new Date(savedState.stepEndTime);
      
      if (now < endTime) {
        // Step is still active, resume it
        setCycleState(savedState);
        setRemainingTime(endTime.getTime() - now.getTime());
      } else {
        // Step has ended, need to recalculate position
        // For simplicity, we'll just reset to idle
        setCycleState({
          isRunning: false,
          currentStep: 'idle',
          cycleNumber: savedState.cycleNumber,
          cycleStartTime: null,
          stepStartTime: null,
          stepEndTime: null,
        });
      }
    }
    
    // Load history
    setHistory(loadHistory());
  }, []);

  /**
   * Save cycle state whenever it changes
   */
  useEffect(() => {
    saveCycleState(cycleState);
  }, [cycleState]);

  /**
   * Move to the next step
   */
  const moveToNextStep = useCallback((skipped: boolean = false) => {
    setCycleState(prev => {
      // Record current step in history
      if (prev.currentStep !== 'idle') {
        const entry: HistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          step: prev.currentStep,
          timestamp: new Date(),
          completed: !skipped,
          skipped,
          cycleNumber: prev.cycleNumber,
        };
        addHistoryEntry(entry);
        setHistory(h => [...h, entry]);
      }

      const nextStep = getNextStep(prev.currentStep);
      const now = new Date();
      const duration = getStepDuration(nextStep, settings);
      const endTime = new Date(now.getTime() + duration);

      // Handle cycle number increment
      const newCycleNumber = nextStep === 'medicine' && prev.currentStep !== 'idle' 
        ? prev.cycleNumber + 1 
        : prev.cycleNumber;

      // Reset notification flag for new step
      hasNotifiedRef.current = false;

      return {
        isRunning: true,
        currentStep: nextStep,
        cycleNumber: nextStep === 'medicine' && prev.currentStep === 'idle' ? 1 : newCycleNumber,
        cycleStartTime: nextStep === 'medicine' ? now : prev.cycleStartTime,
        stepStartTime: now,
        stepEndTime: endTime,
      };
    });
  }, [settings]);

  /**
   * Timer effect - runs every second when cycle is active
   */
  useEffect(() => {
    if (!cycleState.isRunning || !cycleState.stepEndTime) {
      // Clear timer when not running
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Update remaining time every second
    timerRef.current = window.setInterval(() => {
      const now = new Date();
      const endTime = new Date(cycleState.stepEndTime!);
      const remaining = endTime.getTime() - now.getTime();

      if (remaining <= 0) {
        // Time's up! Move to next step
        setRemainingTime(0);
        moveToNextStep(false);
      } else {
        setRemainingTime(remaining);
        
        // Show notification when step starts (only once)
        if (!hasNotifiedRef.current && remaining > 0) {
          hasNotifiedRef.current = true;
          const message = getStepMessage(cycleState.currentStep);
          if (message) {
            notify(getStepDisplayName(cycleState.currentStep), message);
          }
        }
      }
    }, 1000);

    // Initial calculation
    const now = new Date();
    const endTime = new Date(cycleState.stepEndTime);
    setRemainingTime(Math.max(0, endTime.getTime() - now.getTime()));

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [cycleState.isRunning, cycleState.stepEndTime, cycleState.currentStep, moveToNextStep, notify]);

  /**
   * Start a new cycle
   */
  const startCycle = useCallback(() => {
    hasNotifiedRef.current = false;
    const now = new Date();
    const duration = getStepDuration('medicine', settings);
    const endTime = new Date(now.getTime() + duration);

    setCycleState({
      isRunning: true,
      currentStep: 'medicine',
      cycleNumber: 1,
      cycleStartTime: now,
      stepStartTime: now,
      stepEndTime: endTime,
    });

    // Notify immediately
    notify('💊 Medicine Time', 'Give medicine now!');
  }, [settings, notify]);

  /**
   * Stop the current cycle
   */
  const stopCycle = useCallback(() => {
    setCycleState({
      isRunning: false,
      currentStep: 'idle',
      cycleNumber: 0,
      cycleStartTime: null,
      stepStartTime: null,
      stepEndTime: null,
    });
    setRemainingTime(0);
  }, []);

  /**
   * Skip to the next step
   */
  const skipStep = useCallback(() => {
    if (cycleState.isRunning) {
      moveToNextStep(true);
    }
  }, [cycleState.isRunning, moveToNextStep]);

  /**
   * Mark current step as done and move to next
   */
  const markDone = useCallback(() => {
    if (cycleState.isRunning) {
      moveToNextStep(false);
    }
  }, [cycleState.isRunning, moveToNextStep]);

  /**
   * Quick start - jump directly to feeding (emergency start)
   */
  const emergencyStart = useCallback(() => {
    hasNotifiedRef.current = false;
    const now = new Date();
    const duration = getStepDuration('feeding', settings);
    const endTime = new Date(now.getTime() + duration);

    setCycleState({
      isRunning: true,
      currentStep: 'feeding',
      cycleNumber: history.length > 0 ? Math.max(...history.map(h => h.cycleNumber)) + 1 : 1,
      cycleStartTime: now,
      stepStartTime: now,
      stepEndTime: endTime,
    });

    // Notify immediately
    notify('🍼 Feeding Time', 'Emergency feeding started!');
  }, [settings, notify, history]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return {
    cycleState,
    remainingTime,
    history,
    startCycle,
    stopCycle,
    skipStep,
    markDone,
    emergencyStart,
    clearHistory,
  };
}
