// frontend_service/src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/userApi';
import { Container, Typography, TextField, Button, Box, Snackbar, Alert } from '@mui/material';

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      console.log('Login successful, navigating to /news');
      navigate('/news');
    }
  }, [isSuccess, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const data = await loginUser(email, password);

      if (data && data.message === "Login successful") {
        setIsSuccess(true);
        setSnackbarMessage('로그인 성공!');
        setOpenSnackbar(true);
        localStorage.setItem('jwt', data.token);
        onLoginSuccess();
      } else {
        throw new Error('로그인에 실패했습니다.');
      }
    } catch (error) {
      setIsSuccess(false);
      setSnackbarMessage(`로그인 실패: ${error.response?.data?.detail || error.message}`);
      setOpenSnackbar(true);
    }
  };

  const navigateToSignUp = () => {
    navigate('/signup');
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };


  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Login</Typography>
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
          <TextField
            variant="outlined" margin="normal" required fullWidth
            id="email" label="Email Address" name="email" autoComplete="email" autoFocus
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined" margin="normal" required fullWidth
            name="password" label="Password" type="password" id="password" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Log In
          </Button>
          <Button type="button" fullWidth variant="outlined" sx={{ mt: 3, mb: 2 }} onClick={navigateToSignUp}>
            Sign Up
          </Button>
        </Box>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={isSuccess ? "success" : "error"} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default LoginPage;