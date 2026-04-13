import { Paper, Typography, Grid } from '@mui/material';
import { Assignment, Pending, DoneAll, Group } from '@mui/icons-material';

export default function AdminAnalytics({ tasks }) {
  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'bg-blue-500', icon: <Assignment className="text-white" /> },
    { label: 'Pending', value: tasks.filter(t => t.status === 'todo').length, color: 'bg-gray-500', icon: <Pending className="text-white" /> },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: 'bg-yellow-500', icon: <Group className="text-white" /> },
    { label: 'Completed', value: tasks.filter(t => t.status === 'done').length, color: 'bg-green-500', icon: <DoneAll className="text-white" /> },
  ];

  return (
    <Grid container spacing={3} className="mb-8">
      {stats.map((stat, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Paper className="p-5 flex items-center gap-4 shadow-sm border border-gray-100">
            <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <div>
              <Typography variant="caption" className="text-gray-500 block uppercase font-bold">{stat.label}</Typography>
              <Typography variant="h5" className="font-bold">{stat.value}</Typography>
            </div>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}