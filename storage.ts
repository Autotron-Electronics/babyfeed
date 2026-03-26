// ============================================
// Type definitions for Baby Care Reminder App
// ============================================

/**
 * Represents the different steps in a care cycle
 */
export type CycleStep = 
  | 'idle'           // No cycle running
  | 'medicine'       // Time to give medicine
  | 'feeding'        // Feeding time
  | 'burping'        // Burping time
  | 'waiting';       // Waiting for next cycle

/**
 * Settings that users can customize
 */
export interface Settings {
  cycleDuration: number;      // Total cycle duration in minutes (default: 150 = 2.5 hours)
  feedingDuration: number;    // Feeding duration in minutes (default: 30)
  burpingDuration: number;    // Burping duration in minutes (default: 15)
  medicineTime: number;       // Medicine reminder before feeding in minutes (default: 15)
  soundEnabled: boolean;      // Enable/disable notification sounds
  vibrationEnabled: boolean;  // Enable/disable vibration
}

/**
 * A single history entry for a completed step
 */
export interface HistoryEntry {
  id: string;
  step: CycleStep;
  timestamp: Date;
  completed: boolean;
  skipped: boolean;
  cycleNumber: number;
}

/**
 * Current cycle state
 */
export interface CycleState {
  isRunning: boolean;
  currentStep: CycleStep;
  cycleNumber: number;
  cycleStartTime: Date | null;
  stepStartTime: Date | null;
  stepEndTime: Date | null;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: Settings = {
  cycleDuration: 150,      // 2.5 hours
  feedingDuration: 30,     // 30 minutes
  burpingDuration: 15,     // 15 minutes
  medicineTime: 15,        // 15 minutes before feeding
  soundEnabled: true,
  vibrationEnabled: true,
};

/**
 * Helper function to get step display name
 */
export function getStepDisplayName(step: CycleStep): string {
  switch (step) {
    case 'idle': return 'Ready to Start';
    case 'medicine': return '💊 Medicine Time';
    case 'feeding': return '🍼 Feeding Time';
    case 'burping': return '👶 Burping Time';
    case 'waiting': return '⏰ Waiting for Next Cycle';
    default: return 'Unknown';
  }
}

/**
 * Helper function to get step message for notifications
 */
export function getStepMessage(step: CycleStep): string {
  switch (step) {
    case 'medicine': return 'Give medicine now!';
    case 'feeding': return 'Start feeding!';
    case 'burping': return 'Burping time!';
    case 'waiting': return 'Next cycle starting soon!';
    default: return '';
  }
}

/**
 * Helper function to get next step
 */
export function getNextStep(currentStep: CycleStep): CycleStep {
  switch (currentStep) {
    case 'idle': return 'medicine';
    case 'medicine': return 'feeding';
    case 'feeding': return 'burping';
    case 'burping': return 'waiting';
    case 'waiting': return 'medicine';
    default: return 'idle';
  }
}
