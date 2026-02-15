'use client';

import { createContext, useContext } from 'react';

export const EmergencyContext = createContext({ emergencyMode: false });

export function useEmergencyMode() {
  return useContext(EmergencyContext);
}
