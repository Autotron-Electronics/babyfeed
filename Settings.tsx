// ============================================
// Dashboard Component - Main screen showing timer and controls
// ============================================

import React from 'react';
import { CycleState, CycleStep, getStepDisplayName, getNextStep } from '../types';

interface DashboardProps {
  cycleState: CycleState;
  remainingTime: number;
  onStartCycle: () => void;
  onStopCycle: () => void;
  onSkipStep: () => void;
  onMarkDone: () => void;
  onEmergencyStart: () => void;
}

/**
 * Format milliseconds to MM:SS or HH:MM:SS
 */
function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get background color class based on current step
 */
function getStepColor(step: CycleStep): string {
  switch (step) {
    case 'medicine': return 'from-purple-500 to-purple-700';
    case 'feeding': return 'from-pink-500 to-pink-700';
    case 'burping': return 'from-blue-500 to-blue-700';
    case 'waiting': return 'from-amber-500 to-amber-700';
    default: return 'from-gray-500 to-gray-700';
  }
}

/**
 * Get icon for step
 */
function getStepIcon(step: CycleStep): string {
  switch (step) {
    case 'medicine': return '💊';
    case 'feeding': return '🍼';
    case 'burping': return '👶';
    case 'waiting': return '⏰';
    default: return '👶';
  }
}

export const Dashboard: React.FC<DashboardProps> = ({
  cycleState,
  remainingTime,
  onStartCycle,
  onStopCycle,
  onSkipStep,
  onMarkDone,
  onEmergencyStart,
}) => {
  const isRunning = cycleState.isRunning;
  const currentStep = cycleState.currentStep;
  const nextStep = getNextStep(currentStep);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      {/* Current Step Display */}
      <div className={`w-full max-w-md rounded-3xl p-8 text-white bg-gradient-to-br ${getStepColor(currentStep)} shadow-2xl mb-6 transform transition-all duration-300`}>
        {/* Step Icon */}
        <div className="text-center mb-4">
          <span className="text-7xl">{getStepIcon(currentStep)}</span>
        </div>

        {/* Current Step Name */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {getStepDisplayName(currentStep)}
        </h2>

        {/* Cycle Number */}
        {isRunning && (
          <p className="text-center text-white/80 mb-4">
            Cycle #{cycleState.cycleNumber}
          </p>
        )}

        {/* Timer Display */}
        <div className="text-center">
          {isRunning ? (
            <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-wider mb-2 text-white/80">
                Time Remaining
              </p>
              <p className="text-6xl font-mono font-bold tracking-tight">
                {formatTime(remainingTime)}
              </p>
            </div>
          ) : (
            <div className="bg-white/20 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-lg">
                Press "Start Cycle" to begin
              </p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isRunning && cycleState.stepStartTime && cycleState.stepEndTime && (
          <div className="mt-6">
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, 100 - (remainingTime / (cycleState.stepEndTime.getTime() - cycleState.stepStartTime.getTime())) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Next Step Preview */}
      {isRunning && currentStep !== 'idle' && (
        <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Coming Up Next
          </p>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span>{getStepIcon(nextStep)}</span>
            {getStepDisplayName(nextStep)}
          </p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="w-full max-w-md space-y-3">
        {!isRunning ? (
          <>
            {/* Start Cycle Button */}
            <button
              onClick={onStartCycle}
              className="w-full py-5 px-6 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-xl font-bold rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              🚀 Start Cycle
            </button>

            {/* Emergency Quick Start */}
            <button
              onClick={onEmergencyStart}
              className="w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-semibold rounded-2xl shadow-md transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              ⚡ Emergency Quick Start (Skip to Feeding)
            </button>
          </>
        ) : (
          <>
            {/* Done Button */}
            <button
              onClick={onMarkDone}
              className="w-full py-5 px-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              ✅ Done - Next Step
            </button>

            {/* Skip Button */}
            <button
              onClick={onSkipStep}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-lg font-semibold rounded-2xl shadow-md transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              ⏭️ Skip Step
            </button>

            {/* Stop Cycle Button */}
            <button
              onClick={onStopCycle}
              className="w-full py-4 px-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-lg font-semibold rounded-2xl shadow-md transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              ⏹️ Stop Cycle
            </button>
          </>
        )}
      </div>
    </div>
  );
};
