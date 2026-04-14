"use client";

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { deleteTask } from '@/store/taskSlice';
import { useTasksListener } from '@/hooks/useTasksListener';
import { exportToCSV } from '@/utils/exportTasks';

// Components
import AdminAnalytics from '@/components/AdminAnalytics';
import TaskDialog from '@/components/TaskDialog';
import LogoutButton from '@/components/LogoutButton';
import SimpleDate from '../../components/ui/SimpleDatePicker';

// MUI
import { 
  Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, TextField, 
  MenuItem, Box, TablePagination, Autocomplete 
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Download as DownloadIcon 
} from '@mui/icons-material';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: tasks } = useSelector((state) => state.tasks);
  
  // UI States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(null);
  
  // Admin-Specific Filter States
  const [ownerFilter, setOwnerFilter] = useState(null);    // Who created it
  const [assigneeFilter, setAssigneeFilter] = useState(null); // Who is doing it
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Fetch users list only for admin to populate filter dropdowns
    if (user?.role === 'admin') {
      const fetchUsers = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'users'));
          setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [user]);

  // Start Real-time listener
  useTasksListener(user);

  if (!mounted) return null;

  // --- FILTER LOGIC ---
  const filteredTasks = tasks.filter((t) => {
    const s = search.toLowerCase();
    
    // 1. Keyword Search (Title, Desc, or any Email)
    const matchesSearch = 
      t.title?.toLowerCase().includes(s) || 
      t.description?.toLowerCase().includes(s) ||
      t.ownerEmail?.toLowerCase().includes(s) ||
      t.assignedToEmail?.toLowerCase().includes(s);
    
    // 2. Status Filter
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    // 3. Date Filter
    const matchesDate = !dateFilter || t.dueDate === dateFilter.format('YYYY-MM-DD');

    // 4. Admin Independent User Filters
    const matchesOwner = !ownerFilter || t.ownerEmail === ownerFilter.email;
    const matchesAssignee = !assigneeFilter || t.assignedToEmail === assigneeFilter.email;

    return matchesSearch && matchesStatus && matchesDate && matchesOwner && matchesAssignee;
  });

  // Pagination Logic
  const paginatedTasks = filteredTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#F0F2F3', minHeight: '100vh', minWidth: '100vw' }}>
      
      {/* HEADER AREA */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" color="black" className='text-black'>Task Manager</Typography>
          <Typography color="text.secondary" className='text-black'>
            User: <strong>{user?.email}</strong> | Role: <strong>{user?.role?.toUpperCase()}</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LogoutButton />
          {user?.role === 'admin' && (
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportToCSV(filteredTasks)}>
              Export CSV
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedTask(null); setDialogOpen(true); }}>
            Create Task
          </Button>
        </Box>
      </Box>

      {/* ADMIN ANALYTICS (Updates based on filters) */}
      {user?.role === 'admin' && <AdminAnalytics tasks={filteredTasks} />}

      {/* FILTER CONTROLS */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField 
          label="Search keywords..." 
          size="small" 
          sx={{ flexGrow: 1, minWidth: '200px', bgcolor: 'white' }}
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setPage(0); }} 
        />

        {user?.role === 'admin' && (
          <>
            <Autocomplete
              size="small"
              options={allUsers}
              getOptionLabel={(opt) => opt.email || ""}
              sx={{ minWidth: 200, bgcolor: 'white' }}
              value={ownerFilter}
              onChange={(_, val) => { setOwnerFilter(val); setPage(0); }}
              renderInput={(params) => <TextField {...params} label="Created By" />}
            />
            <Autocomplete
              size="small"
              options={allUsers}
              getOptionLabel={(opt) => opt.email || ""}
              sx={{ minWidth: 200, bgcolor: 'white' }}
              value={assigneeFilter}
              onChange={(_, val) => { setAssigneeFilter(val); setPage(0); }}
              renderInput={(params) => <TextField {...params} label="Assigned To" />}
            />
          </>
        )}

        <TextField 
          select 
          label="Status" 
          size="small" 
          sx={{ minWidth: 130, bgcolor: 'white' }} 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="todo">To Do</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="done">Done</MenuItem>
        </TextField>

        <Box sx={{ bgcolor: 'white', borderRadius: 1 }}>
          <SimpleDate 
            label="Filter Date" 
            value={dateFilter} 
            onChange={(newDate) => { setDateFilter(newDate); setPage(0); }} 
          />
        </Box>
      </Box>

      {/* DATA TABLE */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Task Info</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created By</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.length > 0 ? paginatedTasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Due: {task.dueDate || 'No Date'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 'bold',
                    bgcolor: task.status === 'done' ? '#dcfce7' : task.status === 'in-progress' ? '#dbeafe' : '#f1f5f9',
                    color: task.status === 'done' ? '#166534' : task.status === 'in-progress' ? '#1e40af' : '#475569'
                  }}>
                    {task.status?.toUpperCase()}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{task.ownerEmail || 'System'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>{task.assignedToEmail || 'Unassigned'}</Typography>
                </TableCell>
                <TableCell align="right">
                  {(task.ownerId === user.uid || user.role === 'admin') ? (
                  <>
                  <IconButton size="small" onClick={() => { setSelectedTask(task); setDialogOpen(true); }} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { if(confirm('Delete task?')) dispatch(deleteTask(task.id)) }} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  </>) : (<Typography variant="caption" color="text.disabled">
                  View Only
                </Typography>)}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No tasks found matching your filters.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTasks.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      </TableContainer>

      {/* TASK MODAL */}
      {dialogOpen && (
        <TaskDialog 
          open={dialogOpen} 
          handleClose={() => setDialogOpen(false)} 
          task={selectedTask} 
        />
      )}
    </Container>
  );
}