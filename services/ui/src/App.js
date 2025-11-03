import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ClientDetails from './pages/ClientDetails';
import SoftwareDetails from './pages/SoftwareDetails';
import DemoMSP from './pages/DemoMSP';
import DemoIT from './pages/DemoIT';
import ClientsList from './pages/ClientsList';
import MonthlyRevenue from './pages/MonthlyRevenue';
import ActiveLicenses from './pages/ActiveLicenses';
import AtRiskClients from './pages/AtRiskClients';
import InactiveClients from './pages/InactiveClients';
import { logoutUser } from './utils/auth';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

function Layout({ children, isAuthenticated, onLogout, userRole }) {
  const handleLogoClick = () => {
    if (isAuthenticated) {
      const dashboardPath = userRole === 'msp' ? '/msp/dashboard' : '/it/dashboard';
      window.location.href = dashboardPath;
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ bgcolor: '#1a237e' }}>
        <Toolbar>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              cursor: isAuthenticated ? 'pointer' : 'default',
              '&:hover': isAuthenticated ? { opacity: 0.9 } : {}
            }}
            onClick={handleLogoClick}
          >
            <img 
              src="/logo.png" 
              alt="PulseOps AI Logo" 
              style={{ height: '40px', marginRight: '12px', filter: 'brightness(0) invert(1)' }}
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              <Box component="span" sx={{ color: '#fff', fontWeight: 700 }}>Pulse</Box>
              <Box component="span" sx={{ color: '#64b5f6', fontWeight: 700 }}>Ops</Box>
              <Box component="span" sx={{ color: '#fff', fontWeight: 400, ml: 0.5 }}>AI</Box>
            </Typography>
          </Box>
          {isAuthenticated && (
            <>
              <Typography variant="body2" sx={{ mr: 2, color: 'rgba(255,255,255,0.7)' }}>
                {userRole === 'msp' ? 'MSP Account' : 'IT Admin Account'}
              </Typography>
              <Button 
                onClick={onLogout}
                sx={{ 
                  color: '#fff',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app startup
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const lastActivity = localStorage.getItem('lastActivity');

    if (token && storedUser && lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
      const TEN_MINUTES = 10 * 60 * 1000;

      // If session is still valid (within 10 minutes), restore it
      if (timeSinceLastActivity < TEN_MINUTES) {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(userData);
        setUserRole(userData.role);
        // Update last activity time on page refresh
        localStorage.setItem('lastActivity', Date.now().toString());
        console.log('Session restored for user:', userData.email);
      } else {
        // Session expired, clear it
        console.log('Session expired - clearing');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('lastActivity');
      }
    }
    
    // Mark loading as complete
    setIsLoading(false);
  }, []);

  // Auto-logout functionality
  useEffect(() => {
    if (!isAuthenticated) return;

    const LOGOUT_TIMER = 10 * 60 * 1000; // 10 minutes in milliseconds
    let logoutTimeout;

    const resetTimer = () => {
      // Clear existing timeout
      if (logoutTimeout) {
        clearTimeout(logoutTimeout);
      }
      
      // Update last activity time
      localStorage.setItem('lastActivity', Date.now().toString());
      
      // Set new timeout
      logoutTimeout = setTimeout(() => {
        handleLogout();
      }, LOGOUT_TIMER);
    };

    // Events that reset the timer (user activity)
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      if (logoutTimeout) {
        clearTimeout(logoutTimeout);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);

  const handleLogin = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setUserRole(userData.role);
    // Set initial last activity time on login
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  const handleLogout = () => {
    logoutUser();
    localStorage.removeItem('lastActivity');
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  // Show loading screen while checking session
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f5f5f5'
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout isAuthenticated={isAuthenticated} onLogout={handleLogout} userRole={userRole}>
          <Routes>
            {/* Signup Route - Public */}
            <Route 
              path="/signup" 
              element={
                isAuthenticated ? (
                  <Navigate to={userRole === 'msp' ? '/msp' : '/it'} replace />
                ) : (
                  <Signup />
                )
              } 
            />
            
            {/* Login Route - Public */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  <Navigate to={userRole === 'msp' ? '/msp' : '/it'} replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
          
          {/* MSP Dashboard - Protected Route */}
          <Route 
            path="/msp" 
            element={
              isAuthenticated && userRole === 'msp' ? (
                <DemoMSP user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* MSP Clients List - Protected Route */}
          <Route 
            path="/msp/clients" 
            element={
              isAuthenticated && userRole === 'msp' ? (
                <ClientsList user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* MSP Revenue Page - Protected Route */}
          <Route 
            path="/msp/revenue" 
            element={
              isAuthenticated && userRole === 'msp' ? (
                <MonthlyRevenue user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* MSP Licenses Page - Protected Route */}
          <Route 
            path="/msp/licenses" 
            element={
              isAuthenticated && userRole === 'msp' ? (
                <ActiveLicenses user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* MSP At-Risk Clients Page - Protected Route */}
          <Route 
            path="/msp/at-risk" 
            element={
              isAuthenticated && userRole === 'msp' ? (
                <AtRiskClients user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* MSP Inactive Clients Page - Protected Route */}
          <Route 
            path="/msp/inactive-clients" 
            element={
              isAuthenticated && userRole === 'msp' ? (
                <InactiveClients user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/msp/clients/:clientId" 
            element={
              isAuthenticated && userRole === 'msp' ? (
                <ClientDetails user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* IT Dashboard - Protected Route */}
          <Route 
            path="/it" 
            element={
              isAuthenticated && userRole === 'it_admin' ? (
                <DemoIT user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/it/software/:softwareId" 
            element={
              isAuthenticated && userRole === 'it_admin' ? (
                <SoftwareDetails user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Default Route - Redirect based on authentication */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to={userRole === 'msp' ? '/msp' : '/it'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch all - redirect to login */}
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;