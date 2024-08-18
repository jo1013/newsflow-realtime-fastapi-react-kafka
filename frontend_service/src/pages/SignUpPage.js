// SignUpPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../api/userApi';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await signupUser(email, password);
      console.log('회원가입 성공:', response);
      alert("회원가입 성공. 로그인 페이지로 이동합니다.");
      navigate('/login');
    } catch (error) {
      console.error('회원가입 실패:', error);
      alert(error.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default SignUpPage;
