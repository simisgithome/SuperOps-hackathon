import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { clientsAPI } from '../services/clientsAPI';

const ClientsList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [allClients, setAllClients] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newClient, setNewClient] = useState({
    client_id: '',
    name: '',
    industry: '',
    total_licenses: 0,
    monthly_spend: 0,
    contact: '',
    email: '',
    phone: '',
    total_users: 0,
    health_score: 0,
    churn_probability: 15,
    churn_risk: 'low',
    status: 'Active'
  });

  // Industry options for dropdown
  const industryOptions = [
    'Technology',
    'Finance',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Education',
    'Consulting',
    'Software',
    'Security',
    'Marketing',
    'Media',
    'Research',
    'Data Science'
  ];

  // Load clients from database on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const clients = await clientsAPI.getAll();
    
    // Normalize data to handle both API (snake_case) and localStorage (camelCase)
    const normalizedClients = clients.map(client => ({
      ...client,
      name: client.name,
      industry: client.industry,
      licenses: client.licenses || client.total_licenses || 0,
      revenue: client.revenue || client.monthly_spend || 0,
      status: client.status || 'Active',
      healthScore: client.healthScore || client.health_score || 0,
      churnRisk: client.churnRisk || client.churn_probability || 0,
      employees: client.employees || client.total_users || 0
    }));
    
    setAllClients(normalizedClients);
  };

  // Filter active clients based on search (name only) and sort alphabetically
  const filteredClients = allClients
    .filter(client => {
      const searchLower = searchQuery.toLowerCase();
      const name = (client.name || '').toLowerCase();
      const isActive = (client.status || 'Active').toLowerCase() === 'active';
      
      return name.includes(searchLower) && isActive;
    })
    .sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

  // Function to highlight matching text in client name
  const highlightMatch = (name) => {
    if (!searchQuery || !name) return name;
    
    const searchLower = searchQuery.toLowerCase();
    const nameLower = name.toLowerCase();
    const index = nameLower.indexOf(searchLower);
    
    if (index === -1) return name;
    
    const beforeMatch = name.substring(0, index);
    const match = name.substring(index, index + searchQuery.length);
    const afterMatch = name.substring(index + searchQuery.length);
    
    return (
      <>
        {beforeMatch}
        <Box component="span" sx={{ bgcolor: '#ffeb3b', fontWeight: 700, px: 0.5 }}>
          {match}
        </Box>
        {afterMatch}
      </>
    );
  };

  // Summary statistics
  const totalActiveClients = filteredClients.length;
  const totalRevenue = filteredClients.reduce((sum, client) => sum + client.revenue, 0);
  const totalLicenses = filteredClients.reduce((sum, client) => sum + client.licenses, 0);
  const highRiskClients = filteredClients.filter(c => c.churnRisk > 70).length;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewClient = (clientId) => {
    navigate(`/msp/clients/${clientId}`);
  };

  // Function to generate sequential Client ID
  const generateClientId = async () => {
    try {
      const clients = await clientsAPI.getAll();
      
      // Extract existing client IDs and find the highest number
      const clientNumbers = clients
        .map(client => {
          const match = client.client_id?.match(/^CL(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
      
      // Get the next sequential number
      const maxNumber = clientNumbers.length > 0 ? Math.max(...clientNumbers) : 0;
      const nextNumber = maxNumber + 1;
      
      // Format as CL0001, CL0002, etc.
      return `CL${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating client ID:', error);
      // Fallback to timestamp-based ID
      const timestamp = Date.now().toString().slice(-4);
      return `CL${timestamp}`;
    }
  };

  const handleOpenAddDialog = async () => {
    // Auto-generate sequential client ID when dialog opens
    const newClientId = await generateClientId();
    setNewClient(prev => ({
      ...prev,
      client_id: newClientId
    }));
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    // Reset form
    setNewClient({
      client_id: '',
      name: '',
      industry: '',
      total_licenses: 0,
      monthly_spend: 0,
      contact: '',
      email: '',
      phone: '',
      total_users: 0,
      health_score: 0,
      churn_probability: 15,
      churn_risk: 'low',
      status: 'Active'
    });
  };

  const handleFormChange = (field) => (event) => {
    let value = event.target.value;
    
    // Special handling for health_score
    if (field === 'health_score') {
      // Remove leading zeros
      value = value.replace(/^0+/, '') || '0';
      
      // Only allow numbers 0-100
      const numValue = parseInt(value, 10);
      if (value !== '' && (!isNaN(numValue) && (numValue < 0 || numValue > 100))) {
        return; // Don't update if out of range
      }
      
      setNewClient(prev => ({
        ...prev,
        [field]: value === '' ? 0 : numValue
      }));
      return;
    }
    
    setNewClient(prev => ({
      ...prev,
      [field]: field === 'total_licenses' || field === 'monthly_spend' || field === 'total_users' || field === 'churn_probability'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleIndustryChange = (event) => {
    const value = event.target.value;
    setNewClient(prev => ({
      ...prev,
      industry: value
    }));
  };

  const handleAddClient = async () => {
    // Validate required fields (Client ID is auto-generated)
    if (!newClient.name) {
      setSnackbar({
        open: true,
        message: 'Please fill in Client Name',
        severity: 'error'
      });
      return;
    }

    // Check if industry is filled
    if (!newClient.industry) {
      setSnackbar({
        open: true,
        message: 'Please select an Industry',
        severity: 'error'
      });
      return;
    }

    // Validate health score (must be between 0-100)
    const healthScore = parseFloat(newClient.health_score);
    if (isNaN(healthScore) || healthScore < 0 || healthScore > 100) {
      setSnackbar({
        open: true,
        message: 'Health Score must be between 0 and 100',
        severity: 'error'
      });
      return;
    }

    try {
      // Add client via API
      await clientsAPI.create(newClient);
      
      // Reload clients list
      const clients = await clientsAPI.getAll();
      const normalizedClients = clients.map(client => ({
        ...client,
        name: client.name,
        industry: client.industry,
        licenses: client.licenses || client.total_licenses || 0,
        revenue: client.revenue || client.monthly_spend || 0,
        status: client.status || 'Active',
        healthScore: client.healthScore || client.health_score || 0,
        churnRisk: client.churnRisk || client.churn_probability || 0,
        employees: client.employees || client.total_users || 0
      }));
      setAllClients(normalizedClients);
      
      setSnackbar({
        open: true,
        message: `Client added successfully! Client ID: ${newClient.client_id}`,
        severity: 'success'
      });
      
      handleCloseAddDialog();
    } catch (error) {
      console.error('Error adding client:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add client. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Edit handlers
  const handleOpenEditDialog = (client) => {
    setSelectedClient({
      ...client,
      client_id: client.clientId || client.client_id,
      total_licenses: client.licenses || client.total_licenses || 0,
      monthly_spend: client.revenue || client.monthly_spend || 0,
      total_users: client.employees || client.total_users || 0,
      health_score: client.healthScore || client.health_score || 85,
      churn_probability: client.churnRisk || client.churn_probability || 15,
      status: client.status || 'Active'
    });
    
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedClient(null);
  };

  const handleEditFormChange = (field) => (event) => {
    let value = event.target.value;
    
    // Special handling for health_score
    if (field === 'health_score') {
      // Remove leading zeros
      value = value.replace(/^0+/, '') || '0';
      
      // Only allow numbers 0-100
      const numValue = parseInt(value, 10);
      if (value !== '' && (!isNaN(numValue) && (numValue < 0 || numValue > 100))) {
        return; // Don't update if out of range
      }
      
      setSelectedClient(prev => ({
        ...prev,
        [field]: value === '' ? 0 : numValue
      }));
      return;
    }
    
    setSelectedClient(prev => ({
      ...prev,
      [field]: field === 'total_licenses' || field === 'monthly_spend' || field === 'total_users' || field === 'churn_probability'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleEditIndustryChange = (event) => {
    const value = event.target.value;
    setSelectedClient(prev => ({
      ...prev,
      industry: value
    }));
  };

  const handleUpdateClient = async () => {
    if (!selectedClient.name || !selectedClient.industry) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields (Name, Industry)',
        severity: 'error'
      });
      return;
    }

    // Validate health score (must be between 0-100)
    const healthScore = parseFloat(selectedClient.health_score);
    if (isNaN(healthScore) || healthScore < 0 || healthScore > 100) {
      setSnackbar({
        open: true,
        message: 'Health Score must be between 0 and 100',
        severity: 'error'
      });
      return;
    }

    try {
      await clientsAPI.update(selectedClient.id, selectedClient);
      
      // Reload clients
      const clients = await clientsAPI.getAll();
      const normalizedClients = clients.map(client => ({
        ...client,
        name: client.name,
        industry: client.industry,
        licenses: client.licenses || client.total_licenses || 0,
        revenue: client.revenue || client.monthly_spend || 0,
        status: client.status || 'Active',
        healthScore: client.healthScore || client.health_score || 0,
        churnRisk: client.churnRisk || client.churn_probability || 0,
        employees: client.employees || client.total_users || 0
      }));
      setAllClients(normalizedClients);
      
      setSnackbar({
        open: true,
        message: 'Client updated successfully!',
        severity: 'success'
      });
      
      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating client:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update client. Please try again.',
        severity: 'error'
      });
    }
  };

  // Delete handlers
  const handleOpenDeleteDialog = (client) => {
    setSelectedClient(client);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedClient(null);
  };

  const handleDeleteClient = async () => {
    try {
      // Update client status to 'Inactive' instead of deleting
      await clientsAPI.update(selectedClient.id, { status: 'Inactive' });
      
      // Reload clients
      const clients = await clientsAPI.getAll();
      const normalizedClients = clients.map(client => ({
        ...client,
        name: client.name,
        industry: client.industry,
        licenses: client.licenses || client.total_licenses || 0,
        revenue: client.revenue || client.monthly_spend || 0,
        status: client.status || 'Active',
        healthScore: client.healthScore || client.health_score || 0,
        churnRisk: client.churnRisk || client.churn_probability || 0,
        employees: client.employees || client.total_users || 0
      }));
      setAllClients(normalizedClients);
      
      setSnackbar({
        open: true,
        message: 'Client deactivated successfully!',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deactivating client:', error);
      setSnackbar({
        open: true,
        message: 'Failed to deactivate client. Please try again.',
        severity: 'error'
      });
    }
  };

  const getHealthColor = (health) => {
    if (health >= 90) return 'success';
    if (health >= 75) return 'warning';
    return 'error';
  };

  const getRiskColor = (risk) => {
    if (risk > 70) return 'error';
    if (risk > 40) return 'warning';
    return 'success';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={600}>
          All Clients
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Active Clients
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {totalActiveClients}
                  </Typography>
                </Box>
                <Tooltip title="Number of clients with Active status" arrow>
                  <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', cursor: 'pointer' }} />
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                    ${(totalRevenue / 1000).toFixed(0)}K
                  </Typography>
                </Box>
                <Tooltip title="Combined monthly spend from all active clients" arrow>
                  <AttachMoneyIcon sx={{ fontSize: 40, color: 'success.main', cursor: 'pointer' }} />
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Licenses
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 600 }}>
                    {totalLicenses}
                  </Typography>
                </Box>
                <Tooltip title="Total software licenses across all active clients" arrow>
                  <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', cursor: 'pointer' }} />
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    High Risk Clients
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 600, color: 'error.main' }}>
                    {highRiskClients}
                  </Typography>
                </Box>
                <Tooltip title="Clients with churn probability above 70%" arrow>
                  <Box sx={{ fontSize: 40, cursor: 'pointer' }}>⚠️</Box>
                </Tooltip>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Table */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <TextField
            placeholder="Search client name..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 400 }}
          />
          <Button variant="contained" startIcon={<BusinessIcon />} onClick={handleOpenAddDialog}>
            Add New Client
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Client Name</strong></TableCell>
                <TableCell><strong>Industry</strong></TableCell>
                <TableCell align="center"><strong>Licenses</strong></TableCell>
                <TableCell align="right"><strong>Monthly Revenue</strong></TableCell>
                <TableCell align="center"><strong>Health Score</strong></TableCell>
                <TableCell align="center"><strong>Churn Risk</strong></TableCell>
                <TableCell align="center"><strong>Status</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClients
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {highlightMatch(client.name)}
                      </Typography>
                    </TableCell>
                    <TableCell>{client.industry}</TableCell>
                    <TableCell align="center">{client.licenses}</TableCell>
                    <TableCell align="right">${client.revenue.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${client.healthScore}%`}
                        color={getHealthColor(client.healthScore)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${client.churnRisk}%`}
                        color={getRiskColor(client.churnRisk)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={client.status} color="success" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleViewClient(client.id)}
                        title="View"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleOpenEditDialog(client)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDeleteDialog(client)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredClients.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Client Name"
                  value={newClient.name}
                  onChange={handleFormChange('name')}
                  required
                  placeholder="Client Name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={newClient.industry}
                    onChange={handleIndustryChange}
                    label="Industry"
                    displayEmpty
                  >
                    {industryOptions.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newClient.status}
                    onChange={handleFormChange('status')}
                    label="Status"
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Licenses (Optional)"
                  type="number"
                  value={newClient.total_licenses}
                  onChange={handleFormChange('total_licenses')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monthly Spend ($) (Optional)"
                  type="number"
                  value={newClient.monthly_spend}
                  onChange={handleFormChange('monthly_spend')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Users (Optional)"
                  type="number"
                  value={newClient.total_users}
                  onChange={handleFormChange('total_users')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Health Score (0-100) (Optional)"
                  type="number"
                  value={newClient.health_score}
                  onChange={handleFormChange('health_score')}
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  helperText="Enter a value between 0 and 100"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person (Optional)"
                  value={newClient.contact}
                  onChange={handleFormChange('contact')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email (Optional)"
                  type="email"
                  value={newClient.email}
                  onChange={handleFormChange('email')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={newClient.phone}
                  onChange={handleFormChange('phone')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained" color="primary">
            Add Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          {selectedClient && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client ID"
                    value={selectedClient.client_id || selectedClient.clientId || ''}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={selectedClient.name}
                    onChange={handleEditFormChange('name')}
                    required
                    placeholder="Client Name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={selectedClient.industry}
                      onChange={handleEditIndustryChange}
                      label="Industry"
                      displayEmpty
                    >
                      {industryOptions.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={selectedClient.status}
                      onChange={handleEditFormChange('status')}
                      label="Status"
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Licenses"
                    type="number"
                    value={selectedClient.total_licenses}
                    onChange={handleEditFormChange('total_licenses')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly Spend ($)"
                    type="number"
                    value={selectedClient.monthly_spend}
                    onChange={handleEditFormChange('monthly_spend')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Total Users"
                    type="number"
                    value={selectedClient.total_users}
                    onChange={handleEditFormChange('total_users')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Health Score (0-100)"
                    type="number"
                    value={selectedClient.health_score}
                    onChange={handleEditFormChange('health_score')}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    helperText="Enter a value between 0 and 100"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Person"
                    value={selectedClient.contact}
                    onChange={handleEditFormChange('contact')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={selectedClient.email}
                    onChange={handleEditFormChange('email')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={selectedClient.phone}
                    onChange={handleEditFormChange('phone')}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateClient} variant="contained" color="primary">
            Update Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deactivation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to deactivate client "{selectedClient?.name}"?
            The client will be marked as inactive and can be viewed in the Inactive Clients page.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteClient} variant="contained" color="error">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClientsList;
