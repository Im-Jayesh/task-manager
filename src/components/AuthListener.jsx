"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { setUser, clearUser, setAuthLoading } from '@/store/authSlice';

export default function AuthListener({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAuthLoading(true));
    
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        let role = 'user';
        try {
          // Race the doc fetch against a 2s timeout
          const userDoc = await Promise.race([
            getDoc(doc(db, 'users', user.uid)),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000))
          ]);
          
          if (userDoc?.exists()) {
            role = userDoc.data().role;
          }
        } catch (e) {
          console.warn("Firestore unreachable, defaulting to 'user' role");
        }

        dispatch(setUser({ uid: user.uid, email: user.email, role }));
      } else {
        dispatch(clearUser());
      }
    });
  }, [dispatch]);

  return <>{children}</>;
}