import { LocalizationProvider, StaticDatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { Button, Popover, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

type DatePickerProps = {
  open: boolean;
  anchorEl: HTMLButtonElement | null,
  selectedDate: Date;
  onClose: (value: Date) => void;
}

const DatePickerDialog = ({ open, anchorEl, selectedDate, onClose }: DatePickerProps) => {
  const [newDate, setNewDate] = useState<Date>(selectedDate)
  
  useEffect(() => {
    setNewDate(selectedDate)
  }, [selectedDate])

  const handleClose = () => {
    onClose(newDate);
  };

  return (
    <Popover 
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <StaticDatePicker
          disableFuture
          label="Calendar"
          value={newDate}
          openTo="month"
          views={['year', 'month']}
          minDate={new Date(2022, 0, 1)}
          onChange={(newValue) => {setNewDate(newValue || new Date())}}
          renderInput={(params) => <TextField {...params} />}
        />
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{p: 2}}>
          <Button size="large" fullWidth variant="contained" color="inherit" disableElevation onClick={() => onClose(selectedDate)}>Cancel</Button>
          <Button size="large" fullWidth variant="contained" color="primary" disableElevation onClick={() => onClose(newDate)}>Change Date</Button>
        </Stack>
      </LocalizationProvider>
    </Popover>
  );
}

export default DatePickerDialog