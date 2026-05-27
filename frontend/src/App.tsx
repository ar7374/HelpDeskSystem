import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from './shared/theme';
import { useAppSelector } from './store';
import { LoginPage } from './features/auth/LoginPage';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TicketsPage } from './features/tickets/TicketsPage';
import { AuditLogsPage } from './features/audit-logs/AuditLogsPage';

// Simple direct full-page wrapper for Create Incident view
import { CreateTicketDrawer } from './features/tickets/CreateTicketDrawer';

export const App: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // 1. Dark/Light Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('themeMode');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // 2. Active Tab Routing State
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Sync tab options based on user role upon login
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Customer') {
        setCurrentView('tickets'); // Customers default to tickets
      } else {
        setCurrentView('dashboard'); // Agents/Admins default to dashboard
      }
    }
  }, [isAuthenticated, user]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem('themeMode', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  const activeTheme = getAppTheme(darkMode ? 'dark' : 'light');

  // If not signed in, render the login portal directly
  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        <LoginPage />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      <AppShell
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      >
        {/* Dynamic Hash state routing engine */}
        {currentView === 'dashboard' && <DashboardPage />}
        {currentView === 'tickets' && <TicketsPage />}
        {currentView === 'audit-logs' && <AuditLogsPage />}
        {currentView === 'create-ticket' && (
          <CreateTicketDrawer 
            open={true} 
            onClose={() => setCurrentView('tickets')} 
            onSuccess={() => setCurrentView('tickets')}
          />
        )}
      </AppShell>
    </ThemeProvider>
  );
};

export default App;
