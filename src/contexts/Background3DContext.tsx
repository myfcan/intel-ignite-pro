// ============================================
// 3D BACKGROUND SETTINGS CONTEXT
// Manages global settings for 3D backgrounds
// ============================================

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface Background3DSettings {
  enabled: boolean;
  bloomIntensity: number;    // 0 - 2
  particleSpeed: number;     // 0.1 - 2
  opacity: number;           // 0 - 1
  particleCount: number;     // 0.25 - 1 (multiplier)
}

interface Background3DContextType {
  settings: Background3DSettings;
  updateSettings: (partial: Partial<Background3DSettings>) => void;
  resetSettings: () => void;
  toggleEnabled: () => void;
}

const STORAGE_KEY = 'background3d-settings';

const defaultSettings: Background3DSettings = {
  enabled: true,
  bloomIntensity: 1,
  particleSpeed: 1,
  opacity: 1,
  particleCount: 1,
};

const Background3DContext = createContext<Background3DContextType | null>(null);

export const useBackground3D = (): Background3DContextType => {
  const context = useContext(Background3DContext);
  if (!context) {
    throw new Error('useBackground3D must be used within Background3DProvider');
  }
  return context;
};

// Safe hook that returns default values if context is not available
export const useBackground3DSafe = (): Background3DSettings => {
  const context = useContext(Background3DContext);
  return context?.settings ?? defaultSettings;
};

interface Background3DProviderProps {
  children: ReactNode;
}

export const Background3DProvider = ({ children }: Background3DProviderProps) => {
  const [settings, setSettings] = useState<Background3DSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load 3D settings from localStorage');
    }
    return defaultSettings;
  });

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save 3D settings to localStorage');
    }
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<Background3DSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const toggleEnabled = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  return (
    <Background3DContext.Provider value={{ settings, updateSettings, resetSettings, toggleEnabled }}>
      {children}
    </Background3DContext.Provider>
  );
};
