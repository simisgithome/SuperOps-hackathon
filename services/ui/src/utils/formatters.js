export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0.0%';
  // Convert decimal to percentage (0.75 -> 75.0)
  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Check if date is invalid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getChurnRiskColor = (risk) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
  };
  return colors[risk] || '#757575';
};

export const getSeverityColor = (severity) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
  };
  return colors[severity] || '#757575';
};

export const getHealthScoreColor = (score) => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#ff9800';
  return '#f44336';
};

export const getPriorityColor = (priority) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
  };
  return colors[priority] || '#757575';
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};