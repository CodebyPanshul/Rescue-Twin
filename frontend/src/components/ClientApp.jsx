'use client';

import { useState } from 'react';
import { EmergencyContext } from '../context/EmergencyContext';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function ClientApp({ children }) {
  const [emergencyMode, setEmergencyMode] = useState(false);
  return (
    <EmergencyContext.Provider value={{ emergencyMode, setEmergencyMode }}>
      <SiteHeader emergencyMode={emergencyMode} onEmergencyModeChange={setEmergencyMode} />
      <main className={`flex-1 flex flex-col ${emergencyMode ? 'emergency-mode' : ''}`}>{children}</main>
      <SiteFooter />
    </EmergencyContext.Provider>
  );
}
