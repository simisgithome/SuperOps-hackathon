import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Business, Computer } from '@mui/icons-material';
import { loginUser } from '../utils/auth';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = loginUser(email, password);
      
      if (result.success) {
        // Call the onLogin callback to update App.js state
        if (onLogin) {
          onLogin(result.token, result.user);
        }
        
        // Navigate to the appropriate dashboard based on role
        if (result.user.role === 'msp') {
          navigate('/msp');
        } else if (result.user.role === 'it_admin') {
          navigate('/it');
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (userType) => {
    if (userType === 'msp') {
      setEmail('demo-msp@example.com');
      setPassword('password123');
      setRole('msp');
    } else {
      setEmail('demo-it@example.com');
      setPassword('password123');
      setRole('it_admin');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <img 
                src="/logo.png" 
                alt="PulseOps AI Logo" 
                style={{ height: '50px', marginRight: '16px' }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                PulseOps AI
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Autonomous AI for MSPs and IT Teams
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
              Quick Demo Login
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Business />}
                onClick={() => handleQuickLogin('msp')}
              >
                MSP Admin Demo
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Computer />}
                onClick={() => handleQuickLogin('it')}
              >
                IT Admin Demo
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#1976d2', 
                  fontWeight: 600 
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" display="block" align="center" color="text.secondary">
              Demo Accounts:<br />
              MSP: demo-msp@example.com<br />
              IT: demo-it@example.com<br />
              Password: password123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;