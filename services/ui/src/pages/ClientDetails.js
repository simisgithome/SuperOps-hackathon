import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DevicesIcon from '@mui/icons-material/Devices';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { clientsAPI } from '../services/clientsAPI';

const ClientDetails = ({ user, onLogout }) => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    contact: '',
    email: '',
    phone: '',
    employees: ''
  });

  // Load client from database
  useEffect(() => {
    const loadClient = async () => {
      const clientData = await clientsAPI.getById(parseInt(clientId));
      
      if (!clientData) {
        setClient(null);
        return;
      }
      
      // Normalize data to handle both API (snake_case) and localStorage (camelCase)
      // Convert churn_probability from decimal to percentage if needed
      let churnRiskValue = clientData.churnRisk || clientData.churn_probability || 0;
      // If value is less than 1, it's a decimal (0.805), convert to percentage (80.5)
      if (churnRiskValue > 0 && churnRiskValue < 1) {
        churnRiskValue = churnRiskValue * 100;
      }
      
      // Calculate utilization rate dynamically
      const totalLicenses = clientData.licenses || clientData.total_licenses || 0;
      const totalUsers = clientData.employees || clientData.total_users || 0;
      const utilizationRate = clientData.utilization_rate || 
        (totalLicenses > 0 ? Math.round((totalUsers / totalLicenses) * 100) : 0);
      
      const normalizedClient = {
        ...clientData,
        id: clientData.id,
        name: clientData.name || 'Unknown',
        industry: clientData.industry || 'N/A',
        licenses: totalLicenses,
        revenue: clientData.revenue || clientData.monthly_spend || 0,
        status: clientData.status || 'Active',
        healthScore: clientData.healthScore || clientData.health_score || 0,
        churnRisk: churnRiskValue,
        employees: totalUsers,
        activeUsers: totalUsers,
        usageRate: utilizationRate,
        since: clientData.since || new Date().toISOString().split('T')[0],
        contact: clientData.contact || 'Not Available',
        email: clientData.email || 'not.available@example.com',
        phone: clientData.phone || 'N/A'
      };
      
      setClient(normalizedClient);
      setEditFormData({
        contact: normalizedClient.contact,
        email: normalizedClient.email,
        phone: normalizedClient.phone,
        employees: normalizedClient.employees || 0
      });
    };
    loadClient();
  }, [clientId]);

  // If client not found or loading
  if (!client) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Client not found</Alert>
      </Container>
    );
  }

  // Mock usage data
  const usageData = [
    { month: 'Jan', usage: 85, revenue: 11800 },
    { month: 'Feb', usage: 88, revenue: 12000 },
    { month: 'Mar', usage: 90, revenue: 12200 },
    { month: 'Apr', usage: 87, revenue: 12300 },
    { month: 'May', usage: 91, revenue: 12400 },
    { month: 'Jun', usage: 93, revenue: 12500 },
  ];

  // Mock license breakdown
  const licenseBreakdown = [
    { software: 'Microsoft 365', licenses: 15, cost: 4500, usage: 95 },
    { software: 'Adobe Creative Cloud', licenses: 8, cost: 2400, usage: 88 },
    { software: 'Salesforce', licenses: 10, cost: 3200, usage: 92 },
    { software: 'Slack Business', licenses: 12, cost: 2400, usage: 98 },
  ];

  // Generate dynamic AI recommendations based on client data
  const generateRecommendations = () => {
    const recs = [];
    
    // High churn risk recommendations
    if (client.churnRisk > 70) {
      recs.push({
        id: 1,
        priority: 'Critical',
        title: '🚨 Immediate Intervention Required',
        impact: `Prevent $${(client.revenue * 12).toLocaleString()} annual revenue loss`,
        description: `This client has a ${client.churnRisk}% churn probability. Schedule executive review within 24 hours.`
      });
      recs.push({
        id: 2,
        priority: 'High',
        title: 'Schedule Success Call',
        impact: 'Reduce churn risk by 25%',
        description: 'Book a quarterly business review to understand pain points and demonstrate value.'
      });
    } else if (client.churnRisk > 40) {
      recs.push({
        id: 1,
        priority: 'High',
        title: 'Proactive Engagement',
        impact: `Protect $${(client.revenue * 12).toLocaleString()} annual revenue`,
        description: `Monitor closely - ${client.churnRisk}% churn risk detected. Schedule check-in call.`
      });
    }
    
    // Low health score recommendations
    if (client.healthScore < 70) {
      recs.push({
        id: 3,
        priority: 'High',
        title: 'Improve Client Health Score',
        impact: 'Increase retention by 40%',
        description: `Current health score is ${client.healthScore}%. Focus on usage adoption and support response times.`
      });
    }
    
    // Usage optimization
    if (client.usageRate < 80) {
      recs.push({
        id: 4,
        priority: 'Medium',
        title: 'License Optimization Opportunity',
        impact: `Save $${Math.round(client.revenue * 0.15).toLocaleString()}/month`,
        description: `Only ${client.usageRate}% license utilization. Consider rightsizing or training programs.`
      });
    }
    
    // Training recommendation
    if (client.activeUsers < client.employees * 0.8) {
      recs.push({
        id: 5,
        priority: 'Medium',
        title: 'User Adoption Training',
        impact: 'Increase active users by 30%',
        description: `${client.employees - client.activeUsers} employees not actively using services. Offer training sessions.`
      });
    }
    
    // Upsell opportunity for healthy clients
    if (client.healthScore > 85 && client.churnRisk < 30) {
      recs.push({
        id: 6,
        priority: 'Low',
        title: 'Expansion Opportunity',
        impact: `Potential $${Math.round(client.revenue * 0.3).toLocaleString()}/month increase`,
        description: 'High satisfaction client - ideal for upselling additional services or licenses.'
      });
    }
    
    // Always provide at least some recommendations
    if (recs.length === 0) {
      // Provide general recommendations based on client status
      recs.push({
        id: 7,
        priority: 'Medium',
        title: 'Regular Health Check',
        impact: 'Maintain 95%+ retention rate',
        description: `Schedule quarterly review to ensure continued satisfaction and identify growth opportunities.`
      });
      
      recs.push({
        id: 8,
        priority: 'Low',
        title: 'Optimize License Allocation',
        impact: `Potential $${Math.round(client.revenue * 0.1).toLocaleString()}/month savings`,
        description: `Review current ${client.licenses} licenses for optimization opportunities and ensure efficient usage.`
      });
      
      recs.push({
        id: 9,
        priority: 'Low',
        title: 'Enhanced Support Services',
        impact: 'Improve satisfaction by 20%',
        description: `Offer premium support tier to enhance service experience and strengthen relationship.`
      });
    }
    
    return recs.slice(0, 4); // Return top 4 recommendations
  };

  const recommendations = client ? generateRecommendations() : [];

  const getHealthColor = () => {
    if (client.healthScore >= 90) return 'success';
    if (client.healthScore >= 75) return 'warning';
    return 'error';
  };

  const getRiskColor = () => {
    if (client.churnRisk > 70) return 'error';
    if (client.churnRisk > 40) return 'warning';
    return 'success';
  };

  const handleEditClick = () => {
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
    // Reset form to current client data
    setEditFormData({
      contact: client.contact,
      email: client.email,
      phone: client.phone,
      employees: client.employees
    });
  };

  const handleFormChange = (field) => (event) => {
    setEditFormData({
      ...editFormData,
      [field]: event.target.value
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Update client in database
      const updatedClient = {
        ...client,
        contact: editFormData.contact,
        email: editFormData.email,
        phone: editFormData.phone,
        employees: parseInt(editFormData.employees) || client.employees
      };
      
      await clientsAPI.update(parseInt(clientId), updatedClient);
      
      // Fetch the complete updated client data from API to get recalculated health score and churn risk
      const freshClientData = await clientsAPI.getById(parseInt(clientId));
      
      // Convert churn_probability from decimal to percentage if needed
      let churnRiskValue = freshClientData.churnRisk || freshClientData.churn_probability || 0;
      if (churnRiskValue > 0 && churnRiskValue < 1) {
        churnRiskValue = churnRiskValue * 100;
      }
      
      // Calculate utilization rate dynamically from fresh data
      const totalLicenses = freshClientData.licenses || freshClientData.total_licenses || 0;
      const totalUsers = freshClientData.employees || freshClientData.total_users || 0;
      const utilizationRate = freshClientData.utilization_rate || 
        (totalLicenses > 0 ? Math.round((totalUsers / totalLicenses) * 100) : 0);
      
      // Normalize the fresh data
      const normalizedClient = {
        ...freshClientData,
        id: freshClientData.id,
        name: freshClientData.name || 'Unknown',
        industry: freshClientData.industry || 'N/A',
        licenses: totalLicenses,
        revenue: freshClientData.revenue || freshClientData.monthly_spend || 0,
        status: freshClientData.status || 'Active',
        healthScore: freshClientData.healthScore || freshClientData.health_score || 0,
        churnRisk: churnRiskValue,
        employees: totalUsers,
        activeUsers: totalUsers,
        usageRate: utilizationRate,
        since: freshClientData.since || new Date().toISOString().split('T')[0],
        contact: freshClientData.contact || 'Not Available',
        email: freshClientData.email || 'not.available@example.com',
        phone: freshClientData.phone || 'N/A'
      };
      
      // Update local state with fresh data
      setClient(normalizedClient);
      setOpenEditDialog(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  return (
    <Box sx={{ bgcolor: '#f0f2f5', minHeight: '100vh', py: 3 }}>
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header with Back Button */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={600}>
            {client.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {client.industry} • Client since {new Date(client.since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Chip 
          label={client.status} 
          color="success" 
          icon={<CheckCircleIcon />}
        />
      </Box>

      {/* Churn Risk Alert */}
      {client.churnRisk > 70 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>High Churn Risk!</strong> This client has a {client.churnRisk}% probability of churning. Immediate action recommended.
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: '#e8f5e9',
            borderLeft: '4px solid #4caf50',
            boxShadow: 3
          }}>
            <CardContent sx={{ minHeight: 140 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    Monthly Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: '#2e7d32' }}>
                    ${client.revenue.toLocaleString()}
                  </Typography>
                </Box>
                <AttachMoneyIcon sx={{ fontSize: 40, color: '#4caf50' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: '#e3f2fd',
            borderLeft: '4px solid #2196f3',
            boxShadow: 3
          }}>
            <CardContent sx={{ minHeight: 140 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    Total Licenses
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: '#1565c0' }}>
                    {client.licenses}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {client.activeUsers} active users
                  </Typography>
                </Box>
                <DevicesIcon sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: client.healthScore > 20 ? '#e8f5e9' : '#ffebee',
            borderLeft: `4px solid ${client.healthScore > 20 ? '#4caf50' : '#f44336'}`,
            boxShadow: 3
          }}>
            <CardContent sx={{ minHeight: 140 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    Health Score
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    mt: 1, 
                    fontWeight: 600, 
                    color: client.healthScore > 20 ? '#2e7d32' : '#c62828'
                  }}>
                    {client.healthScore}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={client.healthScore} 
                    color={getHealthColor()}
                    sx={{ mt: 1, mr: 1 }}
                  />
                </Box>
                {client.healthScore > 20 ? (
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#4caf50' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 40, color: '#f44336' }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: '100%',
            bgcolor: client.churnRisk >= 70 ? '#ffebee' : client.churnRisk >= 30 ? '#fff9e6' : '#e8f5e9',
            borderLeft: `4px solid ${client.churnRisk >= 70 ? '#f44336' : client.churnRisk >= 30 ? '#ffc107' : '#4caf50'}`,
            boxShadow: 3
          }}>
            <CardContent sx={{ minHeight: 140 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                    Churn Risk
                  </Typography>
                  <Typography variant="h4" sx={{ 
                    mt: 1, 
                    fontWeight: 600, 
                    color: client.churnRisk >= 70 ? '#c62828' : client.churnRisk >= 30 ? '#f57c00' : '#2e7d32'
                  }}>
                    {Math.round(client.churnRisk)}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={client.churnRisk} 
                    color={getRiskColor()}
                    sx={{ mt: 1, mr: 1 }}
                  />
                </Box>
                {client.churnRisk > 25 ? (
                  <ErrorIcon sx={{ fontSize: 40, color: '#f44336' }} />
                ) : (
                  <WarningAmberIcon sx={{ fontSize: 40, color: '#ffc107' }} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            height: '100%', 
            borderRadius: 2, 
            boxShadow: 3,
            bgcolor: '#ffffff'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight={600}>
                Contact Information
              </Typography>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={handleEditClick}
                sx={{ ml: 1 }}
              >
                <EditIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Primary Contact
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {client.contact}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {client.email}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1">
                {client.phone}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Company Size
              </Typography>
              <Typography variant="body1">
                {client.employees} employees
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Usage Rate
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <LinearProgress 
                  variant="determinate" 
                  value={client.usageRate} 
                  sx={{ flex: 1, mr: 2 }}
                />
                <Typography variant="body2" fontWeight={600}>
                  {client.usageRate}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Usage & Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 3,
            bgcolor: '#ffffff'
          }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Usage & Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="usage"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Usage %"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* License Breakdown */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2, 
            boxShadow: 3,
            bgcolor: '#ffffff'
          }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              License Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Software</strong></TableCell>
                    <TableCell align="center"><strong>Licenses</strong></TableCell>
                    <TableCell align="right"><strong>Monthly Cost</strong></TableCell>
                    <TableCell align="center"><strong>Usage</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licenseBreakdown.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.software}</TableCell>
                      <TableCell align="center">{item.licenses}</TableCell>
                      <TableCell align="right">${item.cost.toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <LinearProgress 
                            variant="determinate" 
                            value={item.usage} 
                            sx={{ width: 80, mr: 1 }}
                          />
                          <Typography variant="body2">{item.usage}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                <Typography sx={{ fontSize: '28px' }}>⚡</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                AI Recommendations
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, position: 'relative', zIndex: 1 }}>
              Intelligent insights to improve client retention
            </Typography>
            {recommendations.map((rec) => (
              <Card key={rec.id} sx={{ 
                mb: 2, 
                bgcolor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 1,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  bgcolor: 'white'
                }
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                      {rec.title}
                    </Typography>
                    <Chip
                      label={rec.priority}
                      color={
                        rec.priority === 'Critical' ? 'error' :
                        rec.priority === 'High' ? 'error' : 
                        rec.priority === 'Medium' ? 'warning' : 
                        'default'
                      }
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
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '13px' }}>
                      💡 {rec.impact}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Contact Information Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Contact Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Primary Contact"
              value={editFormData.contact}
              onChange={handleFormChange('contact')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={handleFormChange('email')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Phone"
              value={editFormData.phone}
              onChange={handleFormChange('phone')}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Company Size (Employees)"
              type="number"
              value={editFormData.employees}
              onChange={handleFormChange('employees')}
              margin="normal"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </Box>
  );
};

export default ClientDetails;