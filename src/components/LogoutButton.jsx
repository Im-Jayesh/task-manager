"use client";
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <Button 
      variant="outlined" 
      color="error" 
      startIcon={<LogoutIcon />} 
      onClick={handleLogout}
      size="small"
    >
      Logout
    </Button>
  );
}