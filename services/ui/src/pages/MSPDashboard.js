import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Warning,
  AttachMoney,
  Logout,
  Refresh,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { clientsAPI } from '../services/clientsAPI';

const MSPDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch clients data from API
      const clients = await clientsAPI.getAll();
      
      // Separate active and inactive clients
      const activeClients = clients.filter(c => (c.status || 'Active').toLowerCase() === 'active');
      const inactiveClients = clients.filter(c => (c.status || 'Active').toLowerCase() === 'inactive');
      
      // Calculate high-risk clients (churn_probability > 70 or churn_risk === 'high')
      const highRiskClients = activeClients.filter(client => {
        const probability = client.churn_probability || client.churnProbability || 0;
        const risk = client.churn_risk || client.churnRisk;
        return risk === 'high' || probability > 70;
      }).sort((a, b) => {
        const probA = a.churn_probability || a.churnProbability || 0;
        const probB = b.churn_probability || b.churnProbability || 0;
        return probB - probA; // Sort by probability descending
      });
      
      // Create dashboard data
      const dashboardData = {
        total_clients: activeClients.length,
        inactive_clients: inactiveClients.length,
        total_mrr: activeClients.reduce((sum, c) => sum + (c.monthly_spend || c.revenue || 0), 0),
        avg_health_score: activeClients.length > 0 
          ? activeClients.reduce((sum, c) => sum + (c.health_score || c.healthScore || 0), 0) / activeClients.length 
          : 0,
        high_risk_clients: highRiskClients.length,
        churn_risks: highRiskClients.slice(0, 5)
      };
      
      console.log('Dashboard Data:', dashboardData); // Debug log
      
      const [trendsRes] = await Promise.all([
        analyticsAPI.getRevenueTrends(30),
      ]);
      
      setDashboard(dashboardData);
      setTrends(trendsRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const MetricCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: 2, 
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PulseOps AI - MSP Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.company_name || user?.username}
          </Typography>
          <IconButton color="inherit" onClick={fetchData} sx={{ mr: 1 }}>
            <Refresh />
          </IconButton>
          <IconButton color="inherit" onClick={onLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Key Metrics */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          <Box sx={{ flex: '1 1 180px', minWidth: '180px', maxWidth: '250px' }}>
            <MetricCard
              title="Total Active Clients"
              value={dashboard?.total_clients || 0}
              icon={<People sx={{ fontSize: 28, color: '#1976d2' }} />}
              color="#1976d2"
            />
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: '180px', maxWidth: '250px' }}>
            <Box onClick={() => navigate('/msp/inactive-clients')} sx={{ cursor: 'pointer' }}>
              <MetricCard
                title="Inactive Clients"
                value={dashboard?.inactive_clients || 0}
                icon={<People sx={{ fontSize: 28, color: '#757575' }} />}
                color="#757575"
                subtitle="Click to view details"
              />
            </Box>
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: '180px', maxWidth: '250px' }}>
            <MetricCard
              title="Monthly Recurring Revenue"
              value={formatCurrency(dashboard?.total_mrr || 0)}
              icon={<AttachMoney sx={{ fontSize: 28, color: '#4caf50' }} />}
              color="#4caf50"
            />
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: '180px', maxWidth: '250px' }}>
            <MetricCard
              title="Avg Health Score"
              value={dashboard?.avg_health_score?.toFixed(1) || '0'}
              icon={<TrendingUp sx={{ fontSize: 28, color: '#ff9800' }} />}
              color="#ff9800"
              subtitle="Out of 100"
            />
          </Box>
          <Box sx={{ flex: '1 1 180px', minWidth: '180px', maxWidth: '250px' }}>
            <Box onClick={() => navigate('/msp/at-risk')} sx={{ cursor: 'pointer' }}>
              <MetricCard
                title="High Risk Clients"
                value={dashboard?.high_risk_clients || 0}
                icon={<Warning sx={{ fontSize: 28, color: '#f44336' }} />}
                color="#f44336"
                subtitle="Click to view details"
              />
            </Box>
          </Box>
        </Box>

        {/* Revenue Trends */}
        {trends && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trends (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.trends?.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#4caf50" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Churn Risks */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  High Risk Clients
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/msp/at-risk')}
                >
                  View All
                </Button>
              </Box>
              {dashboard?.churn_risks && dashboard.churn_risks.length > 0 ? (
                dashboard.churn_risks.map((client) => {
                  const probability = client.churn_probability || client.churnProbability || 0;
                  const monthlySpend = client.monthly_spend || client.revenue || 0;
                  const healthScore = client.health_score || client.healthScore || 0;
                  
                  return (
                    <Card 
                      key={client.id} 
                      sx={{ mb: 2, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                      onClick={() => navigate(`/msp/clients/${client.id}`)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {client.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              MRR: {formatCurrency(monthlySpend)}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${probability}%`}
                            sx={{
                              backgroundColor: '#f44336',
                              color: 'white',
                              fontWeight: 600,
                            }}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Health Score: {healthScore?.toFixed(1)}
                        </Typography>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Typography color="text.secondary">No high-risk clients</Typography>
              )}
            </Paper>
          </Grid>

          {/* Upsell Opportunities */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Upsell Opportunities
              </Typography>
              {dashboard?.upsell_opportunities?.slice(0, 5).map((rec) => (
                <Card key={rec.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                        {rec.title}
                      </Typography>
                      <Chip
                        label={rec.priority?.toUpperCase()}
                        color={rec.priority === 'high' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {rec.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#4caf50', fontWeight: 600 }}>
                      Potential Value: {formatCurrency(rec.potential_value)}
                    </Typography>
                  </CardContent>
                </Card>
              )) || <Typography color="text.secondary">No opportunities found</Typography>}
            </Paper>
          </Grid>

          {/* Recent Clients */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Clients
              </Typography>
              <Grid container spacing={2}>
                {dashboard?.recent_clients?.map((client) => (
                  <Grid item xs={12} sm={6} md={4} key={client.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {client.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {client.industry}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            MRR: {formatCurrency(client.monthly_spend)}
                          </Typography>
                          <Chip
                            label={`Score: ${client.health_score?.toFixed(0)}`}
                            size="small"
                            color={client.health_score > 70 ? 'success' : 'warning'}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MSPDashboard;