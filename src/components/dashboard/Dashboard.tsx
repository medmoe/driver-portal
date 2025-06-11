import React from 'react';
import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, you would handle logout logic here
    navigate('/');
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
          Driver Dashboard
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Welcome to the Fleet Master Driver Portal. Your authentication was successful.
        </Typography>
        
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Dashboard;