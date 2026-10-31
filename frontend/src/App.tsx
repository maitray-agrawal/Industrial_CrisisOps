import React, { useState } from 'react';
import { Layout, NavigationTab, UserRole } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { MachinesPage } from './pages/MachinesPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { SopLibraryPage } from './pages/SopLibraryPage';
import { AiInvestigationPage } from './pages/AiInvestigationPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditHistoryPage } from './pages/AuditHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-M204-001');
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>('M-204');
  const [activeRole, setActiveRole] = useState<UserRole>('operator');

  const handleNavigateToIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setCurrentTab('incidents');
  };

  const handleNavigateToMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setCurrentTab('machines');
  };

  const handleNavigateToTab = (tab: string) => {
    setCurrentTab(tab as NavigationTab);
  };

  const normalizedTab = currentTab === 'dashboard' ? 'overview' : currentTab;

  return (
    <Layout
      currentTab={normalizedTab}
      onSelectTab={setCurrentTab}
      activeIncidentCount={1}
      pendingApprovalCount={1}
      activeRole={activeRole}
      onChangeRole={setActiveRole}
    >
      {/* 1. Overview Dashboard */}
      {normalizedTab === 'overview' && (
        <DashboardPage
          onNavigateToIncident={handleNavigateToIncident}
          onNavigateToMachine={handleNavigateToMachine}
          onNavigateToTab={handleNavigateToTab}
        />
      )}

      {/* 2. Incidents & AI Response Queue */}
      {normalizedTab === 'incidents' && (
        <IncidentsPage
          selectedIncidentId={selectedIncidentId}
          activeRole={activeRole}
        />
      )}

      {/* 3. Machine Registry & Telemetry */}
      {normalizedTab === 'machines' && (
        <MachinesPage
          selectedMachineId={selectedMachineId}
        />
      )}

      {/* 4. Live Sensor Monitoring */}
      {normalizedTab === 'monitoring' && (
        <LiveMonitoringPage
          onNavigateToMachine={handleNavigateToMachine}
          onNavigateToIncident={handleNavigateToIncident}
        />
      )}

      {/* 5. Predictive Maintenance & RUL */}
      {normalizedTab === 'predictive' && (
        <PredictiveMaintenancePage
          onNavigateToMachine={handleNavigateToMachine}
          onNavigateToIncident={handleNavigateToIncident}
        />
      )}

      {/* 6. Standard Operating Procedures (SOP Library) */}
      {normalizedTab === 'sops' && (
        <SopLibraryPage />
      )}

      {/* 7. AI Diagnostic Investigation Console */}
      {normalizedTab === 'investigation' && (
        <AiInvestigationPage
          onNavigateToIncident={handleNavigateToIncident}
        />
      )}

      {/* 8. Reports & Reliability Analytics */}
      {normalizedTab === 'analytics' && (
        <AnalyticsPage />
      )}

      {/* 9. Cryptographic Audit History */}
      {normalizedTab === 'audit' && (
        <AuditHistoryPage />
      )}

      {/* 10. Settings & Simulation Deck */}
      {normalizedTab === 'settings' && (
        <SettingsPage />
      )}
    </Layout>
  );
};

export default App;
