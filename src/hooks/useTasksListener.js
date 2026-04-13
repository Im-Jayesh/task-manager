"use client";
import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, or } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setTasksRealtime } from '@/store/taskSlice';

export function useTasksListener(user) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.uid) return;

    const tasksRef = collection(db, 'tasks');
    const q = user.role === 'admin' 
      ? query(tasksRef) 
      : query(tasksRef, or(where('ownerId', '==', user.uid), where('assignedTo', '==', user.uid)));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch(setTasksRealtime(tasks));
    });

    return () => unsubscribe();
  }, [user, dispatch]);
}