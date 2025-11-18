import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { clientsAPI } from '../services/clientsAPI';

const ActiveLicenses = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalLicenses: 0,
    avgLicenses: 0,
    topClient: { name: '', licenses: 0 }
  });
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [highlightedClientId, setHighlightedClientId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Check if there's a client parameter in the URL
    const clientId = searchParams.get('client');
    if (clientId) {
      setHighlightedClientId(clientId);
    }
  }, [searchParams]);

  const loadData = async () => {
    const allClients = await clientsAPI.getAll();
    
    // Filter only active clients
    const activeClients = allClients.filter(c => (c.status || 'Active').toLowerCase() === 'active');
    setClients(activeClients);

    // Calculate stats
    const totalLicenses = activeClients.reduce((sum, client) => {
      const licenses = client.total_licenses || client.licenses || 0;
      return sum + licenses;
    }, 0);
    
    const avgLicenses = activeClients.length > 0 ? Math.round(totalLicenses / activeClients.length) : 0;
    
    const topClient = activeClients.reduce((max, client) => {
      const licenses = client.total_licenses || client.licenses || 0;
      return licenses > max.licenses ? { name: client.name, licenses } : max;
    }, { name: '', licenses: 0 });

    setStats({ totalLicenses, avgLicenses, topClient });
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
  };

  // Generate software license breakdown for a client
  const getClientSoftwareBreakdown = (client) => {
    const licenses = client.total_licenses || client.licenses || 100;
    return [
      { name: 'Microsoft 365', count: Math.round(licenses * 0.35), cost: Math.round(licenses * 0.35 * 12) },
      { name: 'Adobe Creative', count: Math.round(licenses * 0.15), cost: Math.round(licenses * 0.15 * 25) },
      { name: 'Salesforce', count: Math.round(licenses * 0.13), cost: Math.round(licenses * 0.13 * 75) },
      { name: 'Slack', count: Math.round(licenses * 0.20), cost: Math.round(licenses * 0.20 * 8) },
      { name: 'Zoom', count: Math.round(licenses * 0.17), cost: Math.round(licenses * 0.17 * 15) }
    ];
  };

  // Generate 6-month license history
  const getClientLicenseHistory = (client) => {
    const currentLicenses = client.total_licenses || client.licenses || 100;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      licenses: Math.round(currentLicenses * (0.85 + (index * 0.03)))
    }));
  };

  // License distribution by software type
  const licenseDistribution = [
    { name: 'Microsoft 365', value: 420, color: '#0078D4' },
    { name: 'Adobe Creative', value: 185, color: '#FF0000' },
    { name: 'Salesforce', value: 156, color: '#00A1E0' },
    { name: 'Slack', value: 243, color: '#4A154B' },
    { name: 'Zoom', value: 243, color: '#2D8CFF' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/it')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Active Licenses Overview
          </Typography>
        </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Active Licenses
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {stats.totalLicenses.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Licenses per Client
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stats.avgLicenses.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Largest Client
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {stats.topClient.name}
              </Typography>
              <Typography variant="body2" color="primary">
                {stats.topClient.licenses.toLocaleString()} licenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* License Distribution Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          License Distribution by Software
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={licenseDistribution}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {licenseDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>

      {/* Client Licenses Table */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Licenses by Client
          </Typography>
          {highlightedClientId && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={`Filtered: ${clients.find(c => (c.client_id || c.id) === highlightedClientId)?.name || highlightedClientId}`}
                color="warning"
                size="small"
              />
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => {
                  setHighlightedClientId(null);
                  navigate('/msp/licenses');
                }}
              >
                Show All Clients
              </Button>
            </Box>
          )}
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Client Name</strong></TableCell>
                <TableCell><strong>Industry</strong></TableCell>
                <TableCell align="right"><strong>Active Licenses</strong></TableCell>
                <TableCell align="right"><strong>Total Users</strong></TableCell>
                <TableCell align="right"><strong>Utilization Rate</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients
                .filter((client) => {
                  // If highlightedClientId is set, show only that client
                  if (highlightedClientId) {
                    const clientId = client.client_id || client.id;
                    return clientId === highlightedClientId;
                  }
                  // Otherwise show all clients
                  return true;
                })
                .sort((a, b) => {
                  const licensesA = a.total_licenses || a.licenses || 0;
                  const licensesB = b.total_licenses || b.licenses || 0;
                  return licensesB - licensesA;
                })
                .map((client) => {
                  const licenses = client.total_licenses || client.licenses || 0;
                  const users = client.total_users || client.employees || 0;
                  const utilization = licenses > 0 ? Math.round((users / licenses) * 100) : 0;
                  const clientId = client.client_id || client.id;
                  const isHighlighted = highlightedClientId === clientId;
                  
                  // Get churn risk for color coding
                  const churnRisk = client.churn_risk || 'low';
                  const churnProbability = client.churn_probability || client.churnRisk || 0;
                  const churnPercent = churnProbability < 1 ? churnProbability * 100 : churnProbability;
                  
                  // Color code based on churn risk
                  let utilizationColor = 'success.main'; // green for low risk
                  if (churnRisk === 'high' || churnPercent >= 70) {
                    utilizationColor = 'error.main'; // red for high risk
                  } else if (churnRisk === 'medium' || churnPercent >= 30) {
                    utilizationColor = 'warning.main'; // yellow for medium risk
                  }
                  
                  return (
                    <TableRow 
                      key={clientId}
                      id={`client-row-${clientId}`}
                      sx={{
                        backgroundColor: isHighlighted ? '#fff3e0' : 'inherit',
                        transition: 'background-color 0.3s ease',
                        '&:hover': {
                          backgroundColor: isHighlighted ? '#ffe0b2' : 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.industry}</TableCell>
                      <TableCell align="right">{licenses.toLocaleString()}</TableCell>
                      <TableCell align="right">{users.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${utilization}%`}
                          size="small"
                          sx={{
                            backgroundColor: utilizationColor === 'error.main' ? '#ffebee' : 
                                           utilizationColor === 'warning.main' ? '#fff3e0' : '#e8f5e9',
                            color: utilizationColor === 'error.main' ? '#c62828' : 
                                   utilizationColor === 'warning.main' ? '#f57c00' : '#2e7d32',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(client)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* License Details Dialog */}
      {selectedClient && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedClient.name} - License Details
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedClient.industry}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={4}>
                <Card sx={{ bgcolor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">Active Licenses</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {(selectedClient.total_licenses || selectedClient.licenses || 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">Total Users</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#4caf50' }}>
                      {(selectedClient.total_users || selectedClient.employees || 0).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={4}>
                <Card sx={{ bgcolor: '#fff3e0' }}>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">Utilization</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: '#ff9800' }}>
                      {Math.round(((selectedClient.total_users || selectedClient.employees || 0) / (selectedClient.total_licenses || selectedClient.licenses || 1)) * 100)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Client Metrics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Health Score</Typography>
                <Chip 
                  label={`${selectedClient.health_score || 75}/100`}
                  color={(selectedClient.health_score || 75) >= 75 ? 'success' : (selectedClient.health_score || 75) >= 50 ? 'warning' : 'error'}
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">Churn Risk</Typography>
                <Chip 
                  label={selectedClient.churn_risk || 'Low'}
                  color={
                    (selectedClient.churn_risk || '').toLowerCase() === 'high' ? 'error' : 
                    (selectedClient.churn_risk || '').toLowerCase() === 'medium' ? 'warning' : 
                    'success'
                  }
                  sx={{ mt: 0.5 }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* License Growth Chart */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              License Growth (6 Months)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={getClientLicenseHistory(selectedClient)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="licenses" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>

            <Divider sx={{ my: 2 }} />

            {/* Software License Breakdown */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Software License Breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Software</strong></TableCell>
                    <TableCell align="right"><strong>License Count</strong></TableCell>
                    <TableCell align="right"><strong>Est. Monthly Cost</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getClientSoftwareBreakdown(selectedClient).map((software, index) => (
                    <TableRow key={index}>
                      <TableCell>{software.name}</TableCell>
                      <TableCell align="right">{software.count.toLocaleString()}</TableCell>
                      <TableCell align="right">${software.cost.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right">
                      <strong>
                        {getClientSoftwareBreakdown(selectedClient)
                          .reduce((sum, s) => sum + s.count, 0)
                          .toLocaleString()}
                      </strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>
                        ${getClientSoftwareBreakdown(selectedClient)
                          .reduce((sum, s) => sum + s.cost, 0)
                          .toLocaleString()}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
      </Container>
    </Box>
  );
};

export default ActiveLicenses;
