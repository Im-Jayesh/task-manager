import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Fetch tasks based on user role and uid
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ uid, role }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tasks?uid=${uid}&role=${role}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt : serverTimestamp()
      })
      return {id: docRef.id, ...taskData};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update an existing task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...updates }, { rejectWithValue }) => {
    try {
      const taskRef = doc(db, "tasks", id)
      await updateDoc(taskRef, updates);

      return {id, ...updates};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle', 
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasksRealtime: (state, action) => {
      state.items = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add new task to the beginning
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload);
      });
  },
});

export const { setTasksRealtime } = tasksSlice.actions;
export default tasksSlice.reducer;