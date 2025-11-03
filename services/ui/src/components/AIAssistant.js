import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  Fab,
  Fade,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const AIAssistant = ({ dashboardType }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [rotatedQuestions, setRotatedQuestions] = useState([]);
  const messagesEndRef = useRef(null);

  // FAQ Knowledge Base - MSP specific only
  const mspFAQs = {
    'client health': 'Client health scores are calculated based on multiple factors: license utilization (40%), support ticket volume (25%), payment history (20%), and usage trends (15%). A score above 80 is considered healthy.',
    'churn risk': 'Churn risk is determined by analyzing declining usage patterns, low engagement scores, overdue payments, and high support ticket volumes. Critical clients with scores above 70% need immediate attention.',
    'license compliance': 'License compliance issues occur when active users exceed purchased licenses. Review the Active Licenses page to identify over-deployed clients and take corrective action.',
    'revenue tracking': 'Track revenue through the Revenue & License Trend chart. Filter by year and month to analyze growth patterns. Monthly recurring revenue (MRR) is calculated from all active client subscriptions.',
    'priority alerts': 'Priority Alerts highlight critical issues requiring immediate MSP admin attention: license compliance, security updates, contract renewals, payment issues, and declining usage patterns.',
    'contract renewal': 'Contract renewals should be initiated 30-45 days before expiration. Review client satisfaction scores and usage patterns before renewal discussions to ensure value delivery.',
    'support tickets': 'High support ticket volumes may indicate training gaps or product issues. Schedule review calls with clients showing 40%+ increases in ticket volume.',
    'client onboarding': 'New client onboarding includes: account setup, license provisioning, initial training, support channel setup, and baseline metric establishment. Average onboarding takes 7-14 days.',
    'dashboard metrics': 'The MSP dashboard shows: total active licenses, monthly recurring revenue, average health score, and priority alerts. All metrics update in real-time from the database.',
    'license expiration': 'License expiration alerts appear 10-15 days before renewal dates. Process renewals promptly to avoid service disruptions for your clients.'
  };

  // FAQ Knowledge Base - IT specific only
  const itFAQs = {
    'software usage': 'Software usage analytics track application access frequency, active users, and feature utilization. Data helps optimize license allocation and identify underutilized applications.',
    'license optimization': 'License optimization involves identifying unused licenses, right-sizing subscriptions, and reallocating licenses to active users. Can reduce costs by 15-30%.',
    'user activity': 'User activity monitoring tracks login frequency, session duration, and feature usage. Helps identify training needs and potential security concerns.',
    'cost analysis': 'Software cost analysis breaks down expenses by category, department, and user. Use insights to negotiate better contracts and eliminate redundant tools.',
    'compliance check': 'Compliance checks ensure software usage aligns with license agreements. Regular audits prevent over-deployment penalties and legal issues.',
    'renewal schedule': 'Renewal schedules track all software license expiration dates. Set alerts 30+ days before renewals to review necessity and negotiate pricing.',
    'vendor management': 'Vendor management centralizes all software provider relationships, contracts, and support contacts. Streamlines communication and improves service delivery.',
    'security updates': 'Security updates should be applied within 48 hours for critical patches. Schedule maintenance windows during low-usage periods to minimize disruption.',
    'training resources': 'Access training resources through the Help section. Includes video tutorials, documentation, and best practices for software management.',
    'reporting': 'Generate custom reports for software usage, costs, compliance, and user activity. Export data in CSV, PDF, or Excel formats for stakeholder presentations.'
  };

  // Dashboard-specific knowledge base only (no common FAQs)
  const knowledgeBase = dashboardType === 'msp' ? mspFAQs : itFAQs;

  const suggestedQuestions = dashboardType === 'msp' 
    ? [
        'How is client health calculated?',
        'What causes high churn risk?',
        'How do I track revenue trends?',
        'What are priority alerts?',
        'How to handle license compliance issues?',
        'When should I renew contracts?',
        'How to reduce support tickets?',
        'What indicates a healthy client?'
      ]
    : [
        'How to optimize software licenses?',
        'What is usage tracking?',
        'How to check compliance status?',
        'How can I reduce software costs?',
        'What are renewal schedules?',
        'How to analyze user activity?',
        'What security updates are needed?',
        'How to generate reports?'
      ];

  // Only dashboard-specific questions (no common questions)
  const allQuestions = suggestedQuestions;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Rotate 3 random questions when assistant opens
    if (open) {
      const shuffled = [...suggestedQuestions].sort(() => 0.5 - Math.random());
      setRotatedQuestions(shuffled.slice(0, 3));
    }
  }, [open, suggestedQuestions]);

  useEffect(() => {
    // Auto-suggest questions based on input - show only when typing
    if (input.trim().length > 0) {
      const filtered = allQuestions.filter(q => 
        q.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 3)); // Show max 3 suggestions
    } else {
      // Show rotated questions when input is empty
      setFilteredSuggestions(rotatedQuestions);
    }
  }, [input, rotatedQuestions, allQuestions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findAnswer = (question) => {
    const q = question.toLowerCase();
    
    // Direct keyword matching
    for (const [key, answer] of Object.entries(knowledgeBase)) {
      if (q.includes(key)) {
        return answer;
      }
    }

    // Fuzzy matching for common variations
    if (q.includes('health') || q.includes('score')) {
      return knowledgeBase['client health'] || knowledgeBase['software usage'];
    }
    if (q.includes('risk') || q.includes('churn')) {
      return knowledgeBase['churn risk'] || 'Churn risk is calculated based on usage trends, engagement metrics, and payment history.';
    }
    if (q.includes('license') || q.includes('compliance')) {
      return knowledgeBase['license compliance'] || knowledgeBase['license optimization'];
    }
    if (q.includes('revenue') || q.includes('cost') || q.includes('money')) {
      return knowledgeBase['revenue tracking'] || knowledgeBase['cost analysis'];
    }
    if (q.includes('alert') || q.includes('notification')) {
      return knowledgeBase['priority alerts'] || knowledgeBase['notifications'];
    }
    if (q.includes('support') || q.includes('help') || q.includes('ticket')) {
      return knowledgeBase['support tickets'] || knowledgeBase['support'];
    }
    if (q.includes('renewal') || q.includes('contract') || q.includes('expir')) {
      return knowledgeBase['contract renewal'] || knowledgeBase['renewal schedule'];
    }
    if (q.includes('user') || q.includes('activity') || q.includes('usage')) {
      return knowledgeBase['user activity'] || knowledgeBase['software usage'];
    }
    if (q.includes('dashboard') || q.includes('metric')) {
      return knowledgeBase['dashboard metrics'] || knowledgeBase['reporting'];
    }
    if (q.includes('start') || q.includes('begin') || q.includes('first')) {
      return knowledgeBase['get started'];
    }

    // Dashboard-specific fallback message
    const dashboardContext = dashboardType === 'msp' 
      ? "MSP management topics like client health, churn risk, license compliance, revenue tracking, priority alerts, contract renewals, support tickets, and client onboarding"
      : "IT management topics like software usage, license optimization, user activity, cost analysis, compliance checks, renewal schedules, vendor management, security updates, and reporting";
    
    return `I can only answer questions about ${dashboardContext}. Please ask a question related to your ${dashboardType.toUpperCase()} dashboard.`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = input;
    setInput('');
    setLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const answer = findAnswer(questionText);
      const aiMessage = {
        id: Date.now() + 1,
        text: answer,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 800);
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
    setTimeout(() => {
      handleSendDirect(question);
    }, 100);
  };

  const handleSendDirect = async (questionText) => {
    const userMessage = {
      id: Date.now(),
      text: questionText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const answer = findAnswer(questionText);
      const aiMessage = {
        id: Date.now() + 1,
        text: answer,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button with Badge */}
      <Badge 
        badgeContent={messages.length > 0 ? messages.filter(m => m.sender === 'ai').length : null}
        color="error"
        overlap="circular"
      >
        <Fab
          color="secondary"
          aria-label="ai assistant"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
          }}
          onClick={() => setOpen(!open)}
        >
          {open ? <CloseIcon /> : <ChatBubbleIcon sx={{ fontSize: 32 }} />}
        </Fab>
      </Badge>

      {/* Chat Window */}
      <Fade in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 96,
            right: 24,
            width: 400,
            height: 600,
            zIndex: 1000,
            display: open ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon sx={{ fontSize: 28 }} />
              <Typography variant="h6">
                AI Assistant
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              pb: filteredSuggestions.length > 0 ? 18 : 2,
              overflowY: 'auto',
              bgcolor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {/* Welcome Message */}
            {messages.length === 0 && (
              <Box>
                <Box
                  sx={{
                    bgcolor: 'white',
                    p: 2,
                    borderRadius: 2,
                    mb: 2,
                    border: '2px solid #667eea'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LightbulbIcon sx={{ color: '#667eea' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                      Hi! I'm your AI Assistant
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Ask me anything about {dashboardType === 'msp' ? 'managing clients, licenses, and revenue' : 'software usage, license optimization, and compliance'}. 
                    I'm here to help! 💡
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                  💬 Try these questions:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {suggestedQuestions.slice(0, 4).map((q, idx) => (
                    <Chip
                      key={idx}
                      icon={<AutoAwesomeIcon />}
                      label={q}
                      size="small"
                      onClick={() => handleSuggestionClick(q)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: msg.sender === 'user' ? 'primary.main' : '#667eea'
                  }}
                >
                  {msg.sender === 'user' ? <PersonIcon /> : <PsychologyIcon />}
                </Avatar>
                <Box sx={{ maxWidth: '70%' }}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      bgcolor: msg.sender === 'user' ? 'primary.light' : 'white',
                      color: msg.sender === 'user' ? 'white' : 'text.primary',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Paper>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {msg.timestamp}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#667eea' }}>
                  <ChatBubbleIcon />
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#667eea' }} />
                  <Typography variant="caption" color="text.secondary">
                    Thinking...
                  </Typography>
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'white', position: 'relative', zIndex: 10 }}>
            {/* Auto-suggestions - compact panel with 3 questions, fixed to bottom of messages area */}
            {filteredSuggestions.length > 0 && (
              <Paper
                elevation={4}
                sx={{
                  position: 'absolute',
                  bottom: 'calc(100% + 8px)',
                  left: 16,
                  right: 16,
                  maxHeight: 135,
                  overflow: 'auto',
                  zIndex: 1,
                  bgcolor: 'white',
                  border: '2px solid #667eea',
                  borderRadius: 2
                }}
              >
                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#667eea', color: 'white', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>
                    Quick Questions
                  </Typography>
                </Box>
                <List dense sx={{ py: 0.5 }}>
                  {filteredSuggestions.map((suggestion, idx) => (
                    <ListItem key={idx} disablePadding>
                      <ListItemButton 
                        onClick={() => handleSuggestionClick(suggestion)}
                        sx={{
                          py: 0.5,
                          px: 1.5,
                          '&:hover': {
                            bgcolor: '#e8eaf6'
                          }
                        }}
                      >
                        <ListItemText 
                          primary={suggestion}
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            fontSize: '0.8rem',
                            sx: { color: '#333' }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                multiline
                maxRows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || loading}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  },
                  '&.Mui-disabled': {
                    background: '#ccc',
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  );
};

export default AIAssistant;
