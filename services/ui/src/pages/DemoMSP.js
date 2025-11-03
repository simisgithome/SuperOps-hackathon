import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip
} from '@mui/material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';
import UpdateIcon from '@mui/icons-material/Update';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { clientsAPI } from '../services/clientsAPI';
import AIAssistant from '../components/AIAssistant';

const DemoMSP = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalRevenue: 0,
    totalLicenses: 0,
    highRiskClients: 0,
    inactiveClients: 0,
    avgHealthScore: 0
  });

  // Revenue trend filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11 (0 = January)
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth - 1); // Previous month

  // Priority alerts state
  const [priorityAlerts, setPriorityAlerts] = useState([]);

  // Load statistics from database
  useEffect(() => {
    const loadStats = async () => {
      const dbStats = await clientsAPI.getStats();
      setStats(dbStats);
    };
    loadStats();
  }, []);

  // Load priority alerts from backend
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const alerts = await clientsAPI.getAlerts('active');
        console.log('Loaded alerts from backend:', alerts);
        
        if (alerts && alerts.length > 0) {
          // Map backend alerts to include icons
          const alertsWithIcons = alerts.map(alert => ({
            ...alert,
            icon: getAlertIcon(alert.alert_type, alert.priority)
          }));
          setPriorityAlerts(alertsWithIcons);
        } else {
          // Fallback to static alerts if backend returns empty
          console.log('No alerts from backend, using fallback data');
          setPriorityAlerts(getFallbackAlerts());
        }
      } catch (error) {
        console.error('Error loading alerts:', error);
        // Use fallback static alerts if API fails
        setPriorityAlerts(getFallbackAlerts());
      }
    };
    loadAlerts();
  }, []);

  // Fallback static alerts
  const getFallbackAlerts = () => {
    return [
      { 
        id: 1, 
        alert_type: 'critical',
        icon: <ErrorOutlineIcon sx={{ color: '#d32f2f' }} />,
        title: 'License Compliance Issue',
        client_name: 'TechCorp Inc',
        client_id: 1,
        description: 'Over-deployed licenses detected: 125 active users with only 100 licenses',
        impact: 'Compliance Risk',
        action_label: 'Review License Usage',
        action_route: '/msp/licenses?client=TC001',
        due_date: '2 days',
        priority: 'Critical',
        details: 'Navigate to Active Licenses page to review license allocation and usage patterns'
      },
      { 
        id: 2, 
        alert_type: 'warning',
        icon: <SecurityIcon sx={{ color: '#ed6c02' }} />,
        title: 'Security Update Required',
        client_name: 'Acme Solutions',
        client_id: 21,
        description: 'Critical security patches pending for 15+ workstations',
        impact: 'Security Vulnerability',
        action_label: 'Schedule Maintenance',
        action_route: '/msp/clients/21',
        due_date: '5 days',
        priority: 'High',
        details: 'View client details to schedule maintenance window and apply security patches'
      },
      { 
        id: 3, 
        alert_type: 'action',
        icon: <UpdateIcon sx={{ color: '#ff9800' }} />,
        title: 'Contract Renewal Due',
        client_name: 'CloudPeak Inc',
        client_id: 4,
        description: 'Annual contract expires in 30 days - $182,400 ARR at risk',
        impact: '$182K Revenue Risk',
        action_label: 'Contact for Renewal',
        action_route: '/msp/clients/4',
        due_date: '30 days',
        priority: 'High',
        details: 'Open client profile to review contract details and initiate renewal process'
      },
      { 
        id: 4, 
        alert_type: 'support',
        icon: <SupportAgentIcon sx={{ color: '#1976d2' }} />,
        title: 'High Support Ticket Volume',
        client_name: 'Velocity Partners',
        client_id: 5,
        description: '12 open tickets (40% increase) - possible training gap or product issue',
        impact: 'Client Satisfaction Risk',
        action_label: 'Schedule Review Call',
        action_route: '/msp/clients/5',
        due_date: '7 days',
        priority: 'Medium',
        details: 'Access client dashboard to analyze ticket trends and schedule follow-up call'
      },
      { 
        id: 5, 
        alert_type: 'usage',
        icon: <TrendingDownIcon sx={{ color: '#f57c00' }} />,
        title: 'Declining Usage Pattern',
        client_name: 'RetailMax Corp',
        client_id: 23,
        description: 'User activity down 45% over last 60 days - potential churn indicator',
        impact: 'Churn Risk',
        action_label: 'Engagement Check-in',
        action_route: '/msp/clients/23',
        due_date: '14 days',
        priority: 'Medium',
        details: 'Review client health metrics and usage analytics to identify engagement issues'
      },
      { 
        id: 6, 
        alert_type: 'critical',
        icon: <AccountBalanceIcon sx={{ color: '#d32f2f' }} />,
        title: 'Payment Overdue',
        client_name: 'Pinnacle Industries',
        client_id: 17,
        description: 'Invoice #3421 overdue by 15 days - $8,500 outstanding',
        impact: 'Cash Flow Risk',
        action_label: 'Follow Up Payment',
        action_route: '/msp/clients/17',
        due_date: 'Overdue',
        priority: 'Critical',
        details: 'Contact client for payment collection and review account status'
      },
      { 
        id: 7, 
        alert_type: 'warning',
        icon: <EventBusyIcon sx={{ color: '#ed6c02' }} />,
        title: 'License Expiration Pending',
        client_name: 'WaveDriver Inc',
        client_id: 10,
        description: 'Microsoft 365 licenses expiring in 10 days for 45 users',
        impact: 'Service Disruption Risk',
        action_label: 'Renew Licenses',
        action_route: '/msp/licenses',
        due_date: '10 days',
        priority: 'High',
        details: 'Process license renewal to avoid service interruption'
      }
    ];
  };

  // Get appropriate icon based on alert type and priority
  const getAlertIcon = (type, priority) => {
    const colorMap = {
      'critical': '#d32f2f',
      'warning': '#ed6c02',
      'action': '#ff9800',
      'support': '#1976d2',
      'usage': '#f57c00'
    };
    const color = colorMap[type] || '#757575';

    switch (type) {
      case 'critical':
        return <ErrorOutlineIcon sx={{ color }} />;
      case 'warning':
        return <SecurityIcon sx={{ color }} />;
      case 'action':
        return <UpdateIcon sx={{ color }} />;
      case 'support':
        return <SupportAgentIcon sx={{ color }} />;
      case 'usage':
        return <TrendingDownIcon sx={{ color }} />;
      default:
        return <WarningIcon sx={{ color }} />;
    }
  };
  
  // Demo data using database stats
  const kpis = [
    { label: 'Total Active Clients', value: stats.totalClients.toString(), change: '+5.2%', icon: <PeopleIcon sx={{ fontSize: 32, color: '#1976d2' }} />, clickable: true, route: '/msp/clients', color: '#1976d2', bgColor: '#1976d220' },
    { label: 'Inactive Clients', value: stats.inactiveClients.toString(), change: '', icon: <PeopleIcon sx={{ fontSize: 32, color: '#757575' }} />, clickable: true, route: '/msp/inactive-clients', color: '#757575', bgColor: '#75757520', subtitle: 'Click to view details' },
    { label: 'Monthly Revenue', value: `$${(stats.totalRevenue / 1000).toFixed(0)}K`, change: '+12.3%', icon: <AttachMoneyIcon sx={{ fontSize: 32, color: '#4caf50' }} />, clickable: true, route: '/msp/revenue', color: '#4caf50', bgColor: '#4caf5020' },
    { label: 'Active Licenses', value: stats.totalLicenses.toLocaleString(), change: '+8.1%', icon: <TrendingUpIcon sx={{ fontSize: 32, color: '#ff9800' }} />, clickable: true, route: '/msp/licenses', color: '#ff9800', bgColor: '#ff980020' },
    { label: 'At-Risk Clients', value: stats.highRiskClients.toString(), change: '-2', icon: <WarningIcon sx={{ fontSize: 32, color: '#f44336' }} />, clickable: true, route: '/msp/at-risk', color: '#f44336', bgColor: '#f4433620', subtitle: 'Click to view details' }
  ];
  
  const handleCardClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  // Generate available years (assuming clients have been active since 2020)
  const availableYears = [];
  for (let year = 2020; year <= currentYear; year++) {
    availableYears.push(year);
  }

  // Generate months array
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Generate revenue data based on selected filters
  const generateRevenueData = () => {
    const data = [];
    const endMonth = selectedYear === currentYear ? currentMonth - 1 : 11; // Previous month for current year, Dec for past years
    const finalMonth = selectedMonth !== null && selectedMonth <= endMonth ? selectedMonth : endMonth;

    for (let month = 0; month <= finalMonth; month++) {
      // Base values that grow over time
      const yearFactor = (selectedYear - 2020) * 0.15; // 15% growth per year
      const monthFactor = (month / 12) * 0.1; // 10% growth within the year
      const growthFactor = 1 + yearFactor + monthFactor;
      
      const baseRevenue = 95000;
      const baseLicenses = 950;
      
      data.push({
        month: monthNames[month],
        revenue: Math.round(baseRevenue * growthFactor + (Math.random() * 5000 - 2500)),
        licenses: Math.round(baseLicenses * growthFactor + (Math.random() * 50 - 25))
      });
    }
    
    return data;
  };

  const revenueData = generateRevenueData();

  const licenseDistribution = [
    { name: 'Microsoft 365', value: 420, color: '#0078D4' },
    { name: 'Adobe Creative', value: 185, color: '#FF0000' },
    { name: 'Salesforce', value: 156, color: '#00A1E0' },
    { name: 'Slack', value: 243, color: '#4A154B' },
    { name: 'Zoom', value: 243, color: '#2D8CFF' }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        MSP Dashboard - Demo
      </Typography>

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {kpis.map((kpi, index) => (
          <Box key={index} sx={{ flex: '1 1 calc(20% - 24px)', minWidth: '200px' }}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: kpi.clickable ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': kpi.clickable ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                } : {}
              }}
              onClick={() => handleCardClick(kpi.route)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, pr: 1 }}>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                    {kpi.subtitle && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
                        {kpi.subtitle}
                      </Typography>
                    )}
                    {kpi.change && (
                      <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        {kpi.change}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ 
                    backgroundColor: kpi.bgColor,
                    borderRadius: 2, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Grid container spacing={3}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Revenue & License Trend
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {availableYears.map(year => (
                      <MenuItem key={year} value={year}>{year}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>End Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="End Month"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {monthNames.map((month, index) => {
                      // For current year, only show months up to previous month
                      const maxMonth = selectedYear === currentYear ? currentMonth - 1 : 11;
                      if (index <= maxMonth) {
                        return <MenuItem key={index} value={index}>{month}</MenuItem>;
                      }
                      return null;
                    })}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <RechartsTooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="licenses"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Active Licenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* License Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              License Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={licenseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {licenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '200px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value) => <span style={{ display: 'inline-block', maxWidth: '150px', wordWrap: 'break-word', whiteSpace: 'normal' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Priority Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsActiveIcon sx={{ color: '#1976d2', mr: 1, fontSize: 28 }} />
              <Typography variant="h6">
                Priority Alerts & Actions
              </Typography>
              <Chip 
                label={`${priorityAlerts.length} Active`} 
                color="error" 
                size="small" 
                sx={{ ml: 2 }}
              />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="40"></TableCell>
                    <TableCell><strong>Alert</strong></TableCell>
                    <TableCell><strong>Client</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Impact</strong></TableCell>
                    <TableCell><strong>Priority</strong></TableCell>
                    <TableCell><strong>Due In</strong></TableCell>
                    <TableCell><strong>Recommended Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {priorityAlerts.map((alert) => (
                    <TableRow 
                      key={alert.id}
                      sx={{ 
                        '&:hover': { bgcolor: '#f5f5f5' },
                        borderLeft: alert.alert_type === 'critical' ? '4px solid #d32f2f' : 
                                   alert.alert_type === 'warning' ? '4px solid #ed6c02' : 
                                   alert.alert_type === 'action' ? '4px solid #ff9800' : 
                                   '4px solid #1976d2'
                      }}
                    >
                      <TableCell>
                        <Tooltip title={alert.alert_type ? alert.alert_type.toUpperCase() : 'ALERT'}>
                          <Box>{alert.icon}</Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {alert.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#1976d2', 
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                          onClick={() => navigate(`/msp/clients/${alert.client_id}`)}
                        >
                          {alert.client_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: '300px' }}>
                          {alert.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.impact}
                          size="small"
                          variant="outlined"
                          color={alert.alert_type === 'critical' ? 'error' : 
                                alert.alert_type === 'warning' ? 'warning' : 
                                'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.priority}
                          size="small"
                          color={alert.priority === 'Critical' ? 'error' : 
                                alert.priority === 'High' ? 'warning' : 
                                'info'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {alert.due_date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={alert.details} arrow placement="left">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 500,
                                color: '#1976d2',
                                fontStyle: 'italic'
                              }}
                            >
                              {alert.action_label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ℹ️
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* AI Assistant */}
      <AIAssistant dashboardType="msp" />
    </Container>
  );
};

export default DemoMSP;
