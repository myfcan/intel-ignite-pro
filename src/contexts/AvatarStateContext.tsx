import React, { createContext, useContext, useState, ReactNode } from 'react';

type AvatarStateType = 'idle' | 'thinking' | 'speaking' | 'listening';

interface AvatarStateContextType {
  state: AvatarStateType;
  setState: (state: AvatarStateType) => void;
}

const AvatarStateContext = createContext<AvatarStateContextType | undefined>(undefined);

export function AvatarStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AvatarStateType>('idle');

  return (
    <AvatarStateContext.Provider value={{ state, setState }}>
      {children}
    </AvatarStateContext.Provider>
  );
}

export function useAvatarState() {
  const context = useContext(AvatarStateContext);
  if (context === undefined) {
    throw new Error('useAvatarState must be used within an AvatarStateProvider');
  }
  return context;
}
