import React, { useState, useEffect } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  AttachMoney,
  TrendingDown,
  Assessment,
  Logout,
  Refresh,
  Block,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { analyticsAPI } from '../services/api';
import { formatCurrency, formatPercent, getSeverityColor } from '../utils/formatters';

const ITDashboard = ({ user, onLogout }) => {
  const [dashboard, setDashboard] = useState(null);
  const [trends, setTrends] = useState(null);
  const [deptSpend, setDeptSpend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, trendsRes, deptRes] = await Promise.all([
        itAPI.getDashboard(),
        analyticsAPI.getCostTrends(30),
        itAPI.getDepartmentalSpend(),
      ]);
      setDashboard(dashboardRes.data);
      setTrends(trendsRes.data);
      setDeptSpend(deptRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (licenseId) => {
    try {
      await itAPI.deactivateUnused(licenseId, 30);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('Failed to deactivate licenses', err);
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
      <AppBar position="static" sx={{ backgroundColor: '#2e7d32' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PulseOps AI - IT Admin Dashboard
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Total Software"
              value={dashboard?.total_software || 0}
              icon={<Assessment sx={{ fontSize: 32, color: '#2196f3' }} />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Monthly Cost"
              value={formatCurrency(dashboard?.total_monthly_cost || 0)}
              icon={<AttachMoney sx={{ fontSize: 32, color: '#f44336' }} />}
              color="#f44336"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Avg Utilization"
              value={formatPercent(dashboard?.avg_utilization || 0)}
              icon={<TrendingDown sx={{ fontSize: 32, color: '#ff9800' }} />}
              color="#ff9800"
              subtitle={`${dashboard?.active_licenses || 0} / ${dashboard?.total_licenses || 0} licenses`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Savings Potential"
              value={formatCurrency(dashboard?.cost_savings_potential || 0)}
              icon={<TrendingDown sx={{ fontSize: 32, color: '#4caf50' }} />}
              color="#4caf50"
              subtitle="Monthly savings"
            />
          </Grid>
        </Grid>

        {/* Cost Trends */}
        {trends && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Cost Trends (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.trends?.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="total_cost" stroke="#f44336" strokeWidth={2} name="Total Cost" />
                <Line type="monotone" dataKey="optimization_savings" stroke="#4caf50" strokeWidth={2} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        )}

        <Grid container spacing={3}>
          {/* Department Spend */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Departmental Spend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deptSpend}
                    dataKey="monthly_cost"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.department}: ${formatCurrency(entry.monthly_cost)}`}
                  >
                    {deptSpend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recent Anomalies */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Cost Anomalies
              </Typography>
              {dashboard?.recent_anomalies?.slice(0, 5).map((anomaly) => (
                <Card key={anomaly.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {anomaly.software_name}
                      </Typography>
                      <Chip
                        label={anomaly.severity?.toUpperCase()}
                        sx={{
                          backgroundColor: getSeverityColor(anomaly.severity),
                          color: 'white',
                          fontWeight: 600,
                        }}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Expected: {formatCurrency(anomaly.expected_cost)} → Actual: {formatCurrency(anomaly.actual_cost)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Variance: {formatPercent(anomaly.variance_percent)}
                    </Typography>
                    {anomaly.cause && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {anomaly.cause}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )) || <Typography color="text.secondary">No anomalies detected</Typography>}
            </Paper>
          </Grid>

          {/* Low Utilization Software */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Low Utilization Software (Savings Opportunities)
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Software</strong></TableCell>
                      <TableCell align="right"><strong>Total Licenses</strong></TableCell>
                      <TableCell align="right"><strong>Active Users</strong></TableCell>
                      <TableCell align="right"><strong>Utilization</strong></TableCell>
                      <TableCell align="right"><strong>Monthly Cost</strong></TableCell>
                      <TableCell align="right"><strong>Potential Savings</strong></TableCell>
                      <TableCell align="center"><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard?.low_utilization_software?.map((software) => {
                      const unused = software.total_licenses - software.active_users;
                      const savings = (software.monthly_cost / software.total_licenses) * unused;
                      return (
                        <TableRow key={software.id}>
                          <TableCell>{software.software_name}</TableCell>
                          <TableCell align="right">{software.total_licenses}</TableCell>
                          <TableCell align="right">{software.active_users}</TableCell>
                          <TableCell align="right">
                            <Chip 
                              label={formatPercent(software.utilization_percent)}
                              size="small"
                              color={software.utilization_percent < 30 ? 'error' : 'warning'}
                            />
                          </TableCell>
                          <TableCell align="right">{formatCurrency(software.monthly_cost)}</TableCell>
                          <TableCell align="right" sx={{ color: '#4caf50', fontWeight: 600 }}>
                            {formatCurrency(savings)}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Block />}
                              onClick={() => handleDeactivate(software.id)}
                            >
                              Deactivate Unused
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12}>
            <Paper sx={{ 
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
                pointerEvents: 'none'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
                <Box sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  borderRadius: '50%', 
                  p: 1, 
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '28px' }}>💡</Typography>
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  Cost Optimization Recommendations
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, position: 'relative', zIndex: 1 }}>
                AI-powered insights to reduce costs and improve efficiency
              </Typography>
              <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
                {dashboard?.recommendations?.map((rec) => (
                  <Grid item xs={12} md={6} key={rec.id}>
                    <Card sx={{
                      bgcolor: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        bgcolor: 'white'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, color: '#1a1a1a' }}>
                            {rec.title}
                          </Typography>
                          <Chip
                            label={rec.priority?.toUpperCase()}
                            color={rec.priority === 'high' ? 'error' : 'warning'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {rec.description}
                        </Typography>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: '#e8f5e9',
                          borderRadius: 1,
                          p: 1,
                          border: '1px solid #4caf50'
                        }}>
                          <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                            💰 Potential Savings: {formatCurrency(rec.potential_value)}
                          </Typography>
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

export default ITDashboard;