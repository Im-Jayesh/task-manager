"use client";
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, MenuItem, Box 
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask } from '@/store/taskSlice';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function TaskDialog({ open, handleClose, task = null }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: task || {
      title: '',
      description: '',
      status: 'todo',
      dueDate: '',
      assignedTo: '',
      assignedToEmail: ''
    }
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    if (open) fetchUsers();
  }, [open]);

  const onSubmit = (data) => {
  const selectedUser = users.find(u => u.uid === data.assignedTo);
  const payload = {
    ...data,
    assignedToEmail: selectedUser ? selectedUser.email : '',
  };

  if (task?.id) {
    dispatch(updateTask({ id: task.id, ...payload }));
  } else {
    const newTask = {
      ...payload,
      ownerId: user.uid,
      ownerEmail: user.email,
    };
    dispatch(createTask(newTask));
  }
  handleClose();
  reset();
};

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Controller
              name="title"
              control={control}
              rules={{ required: 'Title is required', minLength: { value: 3, message: 'Min 3 chars' } }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Title" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              name="description"
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Description" multiline rows={3} fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" sx={{ flex: 1 }}>
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="dueDate"
                control={control}
                rules={{ 
                  required: 'Required', 
                  validate: val => new Date(val) > new Date() || 'Date must be in the future' 
                }}
                render={({ field, fieldState }) => (
                  <TextField 
                    {...field} 
                    type="date" 
                    label="Due Date" 
                    sx={{ flex: 1 }} 
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!fieldState.error} 
                    helperText={fieldState.error?.message} 
                  />
                )}
              />
            </Box>
            <Controller
              name="assignedTo"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label="Assign To User" fullWidth>
                  <MenuItem value="">None</MenuItem>
                  {users.map(u => (
                    <MenuItem key={u.uid} value={u.uid}>{u.email}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" sx={{ px: 4 }}>Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}