"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { 
  Button, TextField, Typography, Container, Box, 
  Alert, CircularProgress, Snackbar 
} from '@mui/material';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
  setError('');
  try {
    if (isLogin) {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'user', 
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1000);
    }
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <Box sx={{ 
      backgroundColor: '#F0F2F3', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center' 
    }}>
      <Container maxWidth="xs">
        <Box sx={{ 
          p: 4, 
          backgroundColor: '#fff', 
          borderRadius: 2, 
          boxShadow: '0px 4px 20px rgba(0,0,0,0.08)' 
        }}>
          <Typography variant="h5" align="center" gutterBottom>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Account created! Redirecting...</Alert>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email"
              margin="normal"
              {...register('email', { required: 'Email is required' })}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isSubmitting || success}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Min 6 characters' }
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isSubmitting || success}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, height: '48px' }}
              disabled={isSubmitting || success}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Login' : 'Sign Up')}
            </Button>

            <Button 
              fullWidth 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              disabled={isSubmitting || success}
            >
              {isLogin ? "New here? Create account" : "Have an account? Log in"}
            </Button>
          </form>
        </Box>
      </Container>
      
      <Snackbar 
        open={success} 
        message="Login Successful" 
        autoHideDuration={2000} 
      />
    </Box>
  );
}