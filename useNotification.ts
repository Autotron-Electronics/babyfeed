// ============================================
// Settings Component - Customize cycle durations
// ============================================

import React, { useState } from 'react';
import { Settings as SettingsType, DEFAULT_SETTINGS } from '../types';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onClose: () => void;
}

/**
 * Input field component for settings
 */
const SettingInput: React.FC<{
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
}> = ({ label, description, value, onChange, min, max, step = 1, unit }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
    <label className="block">
      <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </span>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {description}
      </p>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
        <span className="w-20 text-center text-lg font-mono font-semibold text-pink-600 dark:text-pink-400">
          {value} {unit}
        </span>
      </div>
    </label>
  </div>
);

/**
 * Toggle switch component
 */
const ToggleSwitch: React.FC<{
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, description, checked, onChange }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4 flex items-center justify-between">
    <div>
      <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </span>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
        checked ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <div
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  // Local state for editing
  const [localSettings, setLocalSettings] = useState<SettingsType>(settings);

  /**
   * Handle save and close
   */
  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  /**
   * Reset to defaults
   */
  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  /**
   * Update a single setting
   */
  const updateSetting = <K extends keyof SettingsType>(
    key: K,
    value: SettingsType[K]
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">⚙️ Settings</h2>
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
            Customize your care cycle timing
          </p>
        </div>

        {/* Settings Form */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <SettingInput
            label="Cycle Duration"
            description="Total time between feeding cycles"
            value={localSettings.cycleDuration}
            onChange={(v) => updateSetting('cycleDuration', v)}
            min={60}
            max={300}
            step={15}
            unit="min"
          />

          <SettingInput
            label="Feeding Duration"
            description="How long the feeding step lasts"
            value={localSettings.feedingDuration}
            onChange={(v) => updateSetting('feedingDuration', v)}
            min={10}
            max={60}
            step={5}
            unit="min"
          />

          <SettingInput
            label="Burping Duration"
            description="How long the burping step lasts"
            value={localSettings.burpingDuration}
            onChange={(v) => updateSetting('burpingDuration', v)}
            min={5}
            max={30}
            step={5}
            unit="min"
          />

          <SettingInput
            label="Medicine Time"
            description="Minutes before feeding to give medicine"
            value={localSettings.medicineTime}
            onChange={(v) => updateSetting('medicineTime', v)}
            min={5}
            max={30}
            step={5}
            unit="min"
          />

          <ToggleSwitch
            label="Notification Sound"
            description="Play sound when step changes"
            checked={localSettings.soundEnabled}
            onChange={(v) => updateSetting('soundEnabled', v)}
          />

          <ToggleSwitch
            label="Vibration"
            description="Vibrate when step changes"
            checked={localSettings.vibrationEnabled}
            onChange={(v) => updateSetting('vibrationEnabled', v)}
          />
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <button
            onClick={handleSave}
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg font-bold rounded-xl shadow-md transition-all duration-200"
          >
            💾 Save Settings
          </button>

          <button
            onClick={handleReset}
            className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-md font-semibold rounded-xl transition-all duration-200"
          >
            🔄 Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};
