'use client';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function SimpleDate({ label, value, onChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker 
        label={label || "Select Date"} 
        value={value} 
        onChange={onChange}
        slotProps={{ field: { clearable: true } }} 
      />
    </LocalizationProvider>
  );
}