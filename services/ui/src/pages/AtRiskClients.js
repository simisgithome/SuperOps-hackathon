import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  LinearProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import { clientsAPI } from '../services/clientsAPI';

const AtRiskClients = () => {
  const navigate = useNavigate();
  const [atRiskClients, setAtRiskClients] = useState([]);
  const [stats, setStats] = useState({
    highRisk: 0,
    mediumRisk: 0,
    potentialRevenueLoss: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allClients = await clientsAPI.getAll();
    
    // Filter only active clients first
    const activeClients = allClients.filter(c => (c.status || 'Active').toLowerCase() === 'active');
    
    // Filter HIGH-RISK clients only (churn_risk is 'high' or churn_probability > 70)
    const atRisk = activeClients.filter(client => {
      const risk = client.churn_risk || client.churnRisk;
      const probability = client.churn_probability || client.churnProbability || 0;
      return risk === 'high' || probability > 70;
    }).sort((a, b) => {
      const probA = a.churn_probability || a.churnProbability || 0;
      const probB = b.churn_probability || b.churnProbability || 0;
      return probB - probA;
    });

    // Calculate stats
    const highRisk = atRisk.length; // All clients shown are high risk
    const mediumRisk = 0; // Not showing medium risk clients anymore

    const potentialRevenueLoss = atRisk.reduce((sum, client) => {
      const revenue = client.monthly_spend || client.revenue || 0;
      const probability = (client.churn_probability || client.churnProbability || 0) / 100;
      return sum + (revenue * probability);
    }, 0);

    setAtRiskClients(atRisk);
    setStats({ highRisk, mediumRisk, potentialRevenueLoss });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          High Risk Clients
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon sx={{ color: 'error.main', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total High Risk Clients
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {stats.highRisk}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Churn probability &gt; 70%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Potential Revenue at Risk
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                ${Math.round(stats.potentialRevenueLoss).toLocaleString()}/mo
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Based on churn probability
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* At-Risk Clients Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Client Risk Analysis
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Client Name</strong></TableCell>
                <TableCell><strong>Industry</strong></TableCell>
                <TableCell align="center"><strong>Risk Level</strong></TableCell>
                <TableCell align="center"><strong>Churn Probability</strong></TableCell>
                <TableCell align="right"><strong>Monthly Revenue</strong></TableCell>
                <TableCell align="right"><strong>Health Score</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {atRiskClients.map((client) => {
                  const probability = client.churn_probability || client.churnProbability || 0;
                  const revenue = client.monthly_spend || client.revenue || 0;
                  const healthScore = client.health_score || client.healthScore || 0;
                  
                  return (
                    <TableRow 
                      key={client.client_id || client.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/msp/clients/${client.id}`)}
                    >
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.industry}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label="High Risk"
                          color="error"
                          size="small"
                          icon={<WarningIcon />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: 'error.main' }}>
                            {probability}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(probability, 100)}
                            color="error"
                            sx={{ width: '100%', height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          ${revenue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={healthScore >= 80 ? 'success.main' : healthScore >= 60 ? 'warning.main' : 'error.main'}
                        >
                          {healthScore}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/msp/clients/${client.id}`);
                          }}
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
    </Container>
  );
};

export default AtRiskClients;
