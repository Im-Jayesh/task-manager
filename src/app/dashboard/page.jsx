"use client";
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteTask } from '@/store/taskSlice';
import { useTasksListener } from '@/hooks/useTasksListener';
import { exportToCSV } from '@/utils/exportTasks';
import AdminAnalytics from '@/components/AdminAnalytics';
import TaskDialog from '@/components/TaskDialog';
import LogoutButton from '@/components/LogoutButton';
import { 
  Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, IconButton, TextField, 
  MenuItem, Box, TablePagination 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items: tasks } = useSelector((state) => state.tasks);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useTasksListener(user);

  if (!mounted) return null;

  const filteredTasks = tasks.filter(t => 
    (t.title?.toLowerCase().includes(search.toLowerCase()) || 
     t.description?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === 'all' || t.status === statusFilter)
  );

  const paginatedTasks = filteredTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="700">Task Manager</Typography>
          <Typography color="text.secondary">User: {user?.email} | Role: {user?.role}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <LogoutButton />
          {user?.role === 'admin' && (
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportToCSV(tasks)}>
              Export
            </Button>
          )}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedTask(null); setDialogOpen(true); }}>
            Create Task
          </Button>
        </Box>
      </Box>

      {user?.role === 'admin' && <AdminAnalytics tasks={tasks} />}

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField 
          label="Search tasks..." 
          size="small" 
          sx={{ flexGrow: 1 }}
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setPage(0); }} 
        />
        <TextField 
          select 
          label="Status" 
          size="small" 
          sx={{ minWidth: 150 }} 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="todo">To Do</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="done">Done</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Task</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned To</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTasks.map((task) => (
              <TableRow key={task.id} hover>
                <TableCell>
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {task.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ 
                    display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.7rem', fontWeight: 'bold',
                    bgcolor: task.status === 'done' ? '#dcfce7' : task.status === 'in-progress' ? '#dbeafe' : '#f1f5f9',
                    color: task.status === 'done' ? '#166534' : task.status === 'in-progress' ? '#1e40af' : '#475569'
                  }}>
                    {task.status.toUpperCase()}
                  </Box>
                </TableCell>
                <TableCell>{task.dueDate}</TableCell>
                <TableCell>{task.assignedToEmail || 'Unassigned'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => { setSelectedTask(task); setDialogOpen(true); }} color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { if(confirm('Delete?')) dispatch(deleteTask(task.id)) }} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredTasks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      </TableContainer>

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