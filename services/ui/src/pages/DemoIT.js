import React, { useState, useEffect } from 'react';
import AIAssistant from '../components/AIAssistant';
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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DevicesIcon from '@mui/icons-material/Devices';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';

const DemoIT = () => {
  const [openCostDialog, setOpenCostDialog] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState(2025);
  const [fromMonth, setFromMonth] = React.useState('Jan');
  const [toMonth, setToMonth] = React.useState('Dec');

  // Get current date for filtering future data
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear(); // 2025
  const currentMonth = currentDate.getMonth(); // 0-11 (November = 10)

  // Full year spending trend data for 2023, 2024, and 2025
  const allSpendingData = {
    2023: [
      { month: 'Jan', actual: 52800, predicted: 52300 },
      { month: 'Feb', actual: 51960, predicted: 51520 },
      { month: 'Mar', actual: 51480, predicted: 50820 },
      { month: 'Apr', actual: 51150, predicted: 50380 },
      { month: 'May', actual: 50820, predicted: 50050 },
      { month: 'Jun', actual: 50380, predicted: 49720 },
      { month: 'Jul', actual: 50160, predicted: 49500 },
      { month: 'Aug', actual: 49940, predicted: 49280 },
      { month: 'Sep', actual: 49720, predicted: 49060 },
      { month: 'Oct', actual: 49500, predicted: 48840 },
      { month: 'Nov', actual: 49280, predicted: 48620 },
      { month: 'Dec', actual: 49060, predicted: 48400 }
    ],
    2024: [
      { month: 'Jan', actual: 48000, predicted: 47500 },
      { month: 'Feb', actual: 47200, predicted: 46800 },
      { month: 'Mar', actual: 46800, predicted: 46200 },
      { month: 'Apr', actual: 46500, predicted: 45800 },
      { month: 'May', actual: 46200, predicted: 45500 },
      { month: 'Jun', actual: 45800, predicted: 45200 },
      { month: 'Jul', actual: 45600, predicted: 45000 },
      { month: 'Aug', actual: 45400, predicted: 44800 },
      { month: 'Sep', actual: 45200, predicted: 44600 },
      { month: 'Oct', actual: 45000, predicted: 44400 },
      { month: 'Nov', actual: 44800, predicted: 44200 },
      { month: 'Dec', actual: 44600, predicted: 44000 }
    ],
    2025: [
      { month: 'Jan', actual: 44400, predicted: 43800 },
      { month: 'Feb', actual: 44000, predicted: 43600 },
      { month: 'Mar', actual: 43600, predicted: 43400 },
      { month: 'Apr', actual: 43200, predicted: 43200 },
      { month: 'May', actual: 42800, predicted: 43000 },
      { month: 'Jun', actual: 42600, predicted: 42800 },
      { month: 'Jul', actual: 42400, predicted: 42600 },
      { month: 'Aug', actual: 42200, predicted: 42400 },
      { month: 'Sep', actual: 42000, predicted: 42200 },
      { month: 'Oct', actual: 41800, predicted: 42000 },
      { month: 'Nov', actual: 41600, predicted: 41800 },
      { month: 'Dec', actual: 0, predicted: 0 } // Future month - no data
    ]
  };

  // Filter spending trend based on selected year and month range
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fromIndex = monthNames.indexOf(fromMonth);
  const toIndex = monthNames.indexOf(toMonth);
  
  // Ensure valid range (if toMonth comes before fromMonth, use full year)
  const startIndex = fromIndex;
  const endIndex = toIndex >= fromIndex ? toIndex : 11;
  
  // Get data for selected year and apply future month filtering
  let spendTrend = (allSpendingData[selectedYear] || allSpendingData[2024])
    .filter((item, index) => index >= startIndex && index <= endIndex)
    .map((item, index) => {
      const monthIndex = startIndex + index;
      
      // If selected year is in the future, show 0 for all months
      if (selectedYear > currentYear) {
        return { ...item, actual: 0, predicted: 0 };
      }
      
      // If selected year is current year, check if month is in the future
      if (selectedYear === currentYear && monthIndex > currentMonth) {
        return { ...item, actual: 0, predicted: 0 };
      }
      
      // Past data - show actual values
      return item;
    });

  // Hardcoded cost breakdown data
  const costBreakdown = [
    { category: 'Productivity', monthly: 16100, annual: 193200, licenses: 75, perLicense: 214.67, software_count: 2 },
    { category: 'Development', monthly: 9200, annual: 110400, licenses: 47, perLicense: 195.74, software_count: 2 },
    { category: 'Communication', monthly: 7800, annual: 93600, licenses: 85, perLicense: 91.76, software_count: 3 },
    { category: 'Security', monthly: 5100, annual: 61200, licenses: 32, perLicense: 159.38, software_count: 3 },
    { category: 'Other', monthly: 3800, annual: 45600, licenses: 25, perLicense: 152.00, software_count: 3 },
    { category: 'Cloud Services', monthly: 3200, annual: 38400, licenses: 23, perLicense: 139.13, software_count: 3 }
  ];

  // Calculate totals from hardcoded data
  const totalMonthlyCost = costBreakdown.reduce((sum, item) => sum + item.monthly, 0);
  const totalLicenses = costBreakdown.reduce((sum, item) => sum + item.licenses, 0);
  const avgCostPerLicense = totalLicenses > 0 ? totalMonthlyCost / totalLicenses : 0;
  
  // Active licenses calculation (95.1% utilization from seed data)
  const activeLicenses = 273; // From seed data: 273 active users out of 287 total
  const unusedLicenses = totalLicenses - activeLicenses; // 287 - 273 = 14

  // Demo data - KPIs (using calculated data from hardcoded values)
  const kpis = [
    { label: 'Monthly Software Cost', value: `$${(totalMonthlyCost / 1000).toFixed(1)}K`, change: '-8.3%', icon: <AttachMoneyIcon /> },
    { label: 'Active Licenses', value: activeLicenses.toString(), change: '+12', icon: <DevicesIcon /> },
    { label: 'Unused Licenses', value: unusedLicenses.toString(), change: '-5', icon: <TrendingDownIcon /> },
    { label: 'Cost Anomalies', value: '2', change: 'New', icon: <WarningIcon /> }
  ];

  // Map backend categories to chart data with colors
  const categoryColors = {
    'Productivity': '#0088FE',
    'Development': '#00C49F',
    'Communication': '#FFBB28',
    'Security': '#FF8042',
    'Cloud Services': '#8884D8',
    'Other': '#FF6B9D'
  };

  const softwareByCategory = costBreakdown.map(item => ({
    name: item.category,
    value: item.monthly,
    color: categoryColors[item.category] || '#8884D8'
  }));

  const recommendations = [
    {
      id: 1,
      title: 'Consolidate Slack licenses',
      impact: 'Save $450/month',
      priority: 'High',
      description: '23 unused licenses detected in the last 30 days'
    },
    {
      id: 2,
      title: 'Upgrade Adobe plan',
      impact: 'Save $280/month',
      priority: 'Medium',
      description: 'Switch from individual to team plan for better pricing'
    },
    {
      id: 3,
      title: 'Review Zoom subscription',
      impact: 'Save $120/month',
      priority: 'Low',
      description: 'Usage dropped 40% since Microsoft Teams adoption'
    }
  ];

  const anomalies = [
    {
      id: 1,
      software: 'GitHub Enterprise',
      cost: 8900,
      expected: 6500,
      increase: '+37%',
      reason: 'Spike in user additions'
    },
    {
      id: 2,
      software: 'AWS Services',
      cost: 12400,
      expected: 11200,
      increase: '+11%',
      reason: 'Increased compute usage'
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        IT Team Dashboard - Demo
      </Typography>

      {/* Anomaly Alert */}
      <Alert severity="warning" sx={{ mb: 3 }}>
        <strong>2 cost anomalies detected</strong> - Review unexpected spending increases
      </Alert>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: index === 0 ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': index === 0 ? {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                } : {}
              }}
              onClick={() => index === 0 && setOpenCostDialog(true)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      {kpi.label}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                      {kpi.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={kpi.change.includes('-') || kpi.change === 'New' ? 'success.main' : 'text.secondary'}
                      sx={{ mt: 1 }}
                    >
                      {kpi.change}
                    </Typography>
                  </Box>
                  <Box sx={{ color: 'primary.main', fontSize: 40 }}>
                    {kpi.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Spending Trend */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Monthly Software Spending Trend
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <MenuItem value={2025}>2025</MenuItem>
                    <MenuItem value={2024}>2024</MenuItem>
                    <MenuItem value={2023}>2023</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>From</InputLabel>
                  <Select
                    value={fromMonth}
                    label="From"
                    onChange={(e) => setFromMonth(e.target.value)}
                  >
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>To</InputLabel>
                  <Select
                    value={toMonth}
                    label="To"
                    onChange={(e) => setToMonth(e.target.value)}
                  >
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => (
                      <MenuItem key={month} value={month}>{month}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={spendTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#8884d8"
                    strokeWidth={2}
                    name="Actual Spend"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                </LineChart>
              </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Software by Category */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={softwareByCategory}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                  >
                    {softwareByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    iconType="circle"
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '13px'
                    }}
                    formatter={(value, entry) => {
                      const percentage = ((entry.payload.value / softwareByCategory.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0);
                      return `${value}: ${percentage}% ($${entry.payload.value.toLocaleString()})`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* AI Recommendations */}
        <Grid item xs={12} md={6}>
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
                <Typography sx={{ fontSize: '28px' }}>⚡</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                AI-Powered Recommendations
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, position: 'relative', zIndex: 1 }}>
              Smart actions to optimize your IT operations
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
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Box sx={{ flex: 1, pr: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                        {rec.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {rec.description}
                      </Typography>
                      <Box sx={{
                        display: 'inline-block',
                        bgcolor: '#e8f5e9',
                        borderRadius: 1,
                        p: 0.75,
                        mt: 1.5,
                        border: '1px solid #4caf50'
                      }}>
                        <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600, fontSize: '13px' }}>
                          {rec.impact}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={rec.priority}
                      color={rec.priority === 'High' ? 'error' : rec.priority === 'Medium' ? 'warning' : 'default'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Cost Anomalies */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cost Anomalies Detected
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Software</strong></TableCell>
                    <TableCell><strong>Current</strong></TableCell>
                    <TableCell><strong>Expected</strong></TableCell>
                    <TableCell><strong>Change</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anomalies.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {anomaly.software}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {anomaly.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>${anomaly.cost.toLocaleString()}</TableCell>
                      <TableCell>${anomaly.expected.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={anomaly.increase}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Software Cost Details Dialog */}
      <Dialog 
        open={openCostDialog} 
        onClose={() => setOpenCostDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <AttachMoneyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  Monthly Software Cost Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: $45,200 | Annual: $542,400
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpenCostDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#e3f2fd', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={600} color="primary">
                  $45.2K
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monthly Total
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#f3e5f5', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={600} color="secondary">
                  287
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Licenses
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#e8f5e9', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: '#2e7d32' }}>
                  $157
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Avg Cost/License
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper sx={{ p: 2, bgcolor: '#fff3e0', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={600} sx={{ color: '#e65100' }}>
                  -8.3%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs Last Month
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Cost Breakdown Table */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
            Cost Breakdown by Category
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell align="right"><strong>Monthly Cost</strong></TableCell>
                  <TableCell align="right"><strong>Annual Cost</strong></TableCell>
                  <TableCell align="center"><strong>Licenses</strong></TableCell>
                  <TableCell align="right"><strong>Cost/License</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costBreakdown.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.category}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600} color="primary">
                        ${item.monthly.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        ${item.annual.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={item.licenses} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${item.perLicense.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>
                    <Typography variant="body1" fontWeight={700}>
                      TOTAL
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={700} color="primary">
                      ${totalMonthlyCost.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={700}>
                      ${(totalMonthlyCost * 12).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label={totalLicenses} size="small" color="primary" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={700}>
                      ${avgCostPerLicense.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Key Insights */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              💡 Key Insights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Cost decreased by 8.3% compared to last month
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • Productivity Suite accounts for 35% of total spending
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              • 23 unused licenses detected - potential savings of $3.6K/month
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Development Tools have the highest per-license cost at $275.56
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      {/* AI Assistant */}
      <AIAssistant dashboardType="it" />
    </Container>
  );
};

export default DemoIT;
