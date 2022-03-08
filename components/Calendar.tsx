import { useEffect, useState } from "react";
import { format } from "date-fns"

import { Box, Button, IconButton, List, ListItem, ListItemText, Paper, Popover, Stack, TextField, Tooltip, Typography } from "@mui/material";
import type { Theme } from '@mui/material'
import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material";
import { StaticDatePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';

import { hexToRgb } from "../lib/colours"
import { useBreakPoints } from "../lib/hooks"
import PurchaseDetails from "../models/PurchaseDetails";
import toast from "react-hot-toast";
import { DatePickerDialog } from ".";

type ContentItems = {
  date: Date,
  items: PurchaseDetails[],
  total: number
}

type CalendarProps = {
  calDate: Date,
  setCalDate: any, // useState function
  dateFrom: Date,
  dateTo: Date,
  weeklyView?: boolean,
  content: ContentItems[]
}

const Calendar = ({ calDate, setCalDate, dateFrom, dateTo, weeklyView=false, content=[] }: CalendarProps) => {

  const isEmpty = content.filter(({ items }) => items.length > 0).length === 0

  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLButtonElement | null>(null)
  
  const calMonth = calDate.getMonth()
  const calYear = calDate.getFullYear()
  const startDay = dateFrom.getDay()
  const endDay = dateTo.getDay()
  
  const { mdScreen } = useBreakPoints()

  const styles = {
    gridBox: {
      width: '100%', 
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gridTemplateRow: {
        xs: 'none',
        md: `auto repeat(${content.length / 7}, 1fr)`
      },
      columnGap: { xs: 0, md: 0.25 },
      rowGap: { xs: 0, md: 0.25 },
      backgroundColor: 'white',
      overflow: 'hidden',
    },
  }

  const handleOpenDatePicker = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDatePickerAnchor(e.currentTarget)
    setDatePickerOpen(true)
  }

  const handleCloseDatePicker = (value: Date) => {
    setDatePickerOpen(false)
    setDatePickerAnchor(null)
    setCalDate(value)
  }

  const handlePrevButton = () => {
    const newDate = weeklyView ? 
      new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate() - 7)
      : new Date(calYear, calMonth - 1, 1)

    if (newDate.getFullYear() < 2022) {
      toast.error("Minimum date must be in the year 2022")
    } else {
      setCalDate(newDate)
    }
  }

  const handleNextButton = () => {
    if (weeklyView) {
      setCalDate(new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate() + 7))
    } else {
      setCalDate(new Date(calYear, calMonth + 1, 1))
    }
  }

  return (
    <>
      <Paper sx={{ p: 2, mb: 4 }} elevation={0}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb: 1}}>
          {calDate.getFullYear() <= new Date().getFullYear() && calDate.getMonth() <= 0 ? (
            <Tooltip title="Minimum date must be in the year 2022" followCursor>
              <span>
                <IconButton disabled size="large" color="default"><ChevronLeft /></IconButton>
              </span>
            </Tooltip>
           ) : (
            <IconButton size="large" color="default" aria-label={`Go to previous ${weeklyView ? "week" : "month"}`} onClick={handlePrevButton}><ChevronLeft /></IconButton>
           )}
          {weeklyView ? (
            <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              {format(dateFrom, mdScreen ? 'dd MMM yyyy' : 'MMM dd')} &mdash; {format(dateTo, mdScreen ? 'dd MMM yyyy' : 'MMM dd')}
            </Typography>
          ) : (
          <Button variant="text" size="large" color="inherit" sx={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }} endIcon={<Today/>} onClick={(e) => handleOpenDatePicker(e)}>
            {format(calDate, 'MMMM yyyy')}{" "} 
          </Button>
          )}
          {calDate.getFullYear() === new Date().getFullYear() && calDate.getMonth() === new Date().getMonth() ? (
            <Tooltip title="Cannot view dates in the future" followCursor>
              <span>
                <IconButton disabled size="large" color="default"><ChevronRight /></IconButton>
              </span>
            </Tooltip>
           ) : (
            <IconButton size="large" color="default" aria-label={`Go to next ${weeklyView ? "week" : "month"}`} onClick={handleNextButton}><ChevronRight /></IconButton>
           )}
          
        </Stack>
        {isEmpty && (<Typography display={{xs: 'block', md: 'none'}}  component="p" variant="body2" textAlign="center">
          No purchases available.
        </Typography>)}
        <Box sx={styles.gridBox}>
          <WeekDays />
          <CalendarDays startDay={startDay} endDay={endDay} content={content} weeklyView={weeklyView} />
        </Box>
        
      </Paper>

      <DatePickerDialog open={datePickerOpen} anchorEl={datePickerAnchor} selectedDate={calDate} onClose={handleCloseDatePicker} />
    </>
  )
}
export default Calendar


const WeekDays = () => {

  const { lgScreen } = useBreakPoints()
  const weekDays = lgScreen ? 
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] 
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const styles = {
    weekDays: {
      display: {
        xs: 'none',
        md: 'initial'
      },
      backgroundColor: (theme: Theme) => theme.palette.primary.main,
      color: (theme: Theme) => theme.palette.common.white,
      p: 1,
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
    },
  }

  return (
    <>
    {weekDays.map((weekDay, i) => ( 
      <Box key={i} sx={styles.weekDays}>{weekDay}</Box>
    ))}
    </>
  )
}

const CalendarDays = ({ startDay, endDay, content, weeklyView }: {startDay: number, endDay: number, content: ContentItems[], weeklyView: boolean}) => {

  const { mdScreen } = useBreakPoints()

  const styles = {
    dayBox: {
      backgroundColor: 'white',
      height: 'auto',
    },
    dayBoxEmpty: {
      backgroundColor: (theme: Theme) => theme.palette.grey[300],
      height: 'auto'
    },
    dayBoxHidden: {
      display: {
        xs: 'none',
        md: 'block'
      },
      backgroundColor: 'white',
      height: 'auto',
    },
    dayBoxHeader: {
      backgroundColor: (theme: Theme) => hexToRgb(theme.palette.secondary.main, '15%'),
      px: 1,
      py: 0.5,
      lineHeight: 'normal'
    },   
    dayBoxContent: {
      backgroundColor: (theme: Theme) => theme.palette.grey[50],
      height: {
        xs: 'fit-content',
        md: '5.5rem'
      },
      overflowY: 'auto',
      pl: 1,
    },
    dayBoxFooter: {
      backgroundColor: (theme: Theme) => hexToRgb(theme.palette.primary.main, '15%'),
      px: 1,
      py: 0.5,
      fontStyle: 'italic',
      textAlign: 'right',
    }
  }

  const getAmount = (amount: number, showZero = false) => {
    const value = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
    return showZero || amount > 0 ? value : ""
  }

  return (
    <>
      {!weeklyView && <Box gridColumn={`span ${startDay}`} sx={styles.dayBoxEmpty}></Box>}
      {content.map((day, i) => (
        <Box key={i} gridColumn={`span ${mdScreen ? '1' : '7'}`} sx={day.items.length > 0 ? styles.dayBox : styles.dayBoxHidden}>
        {day && (<>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={styles.dayBoxHeader}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              {mdScreen ? day.date.getDate() : format(day.date, 'ccc, PP')}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontStyle: 'italic' }}>
              {getAmount(day.items.map(item => item.amount).reduce((prev, curr) => prev + curr, 0))}
            </Typography>
          </Stack>
          <Box sx={styles.dayBoxContent}>
            <List dense>
            {day.items.map((item, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0, my: 0 }}>
                <Tooltip title={`${item.description} (${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'}).format(item.amount)})`} followCursor>
                  <ListItemText primary={`${item.categoryIcon} ${item.purchase}`} />
                </Tooltip>
                
              </ListItem>
            ))}
            </List>
          </Box>
          <Box sx={styles.dayBoxFooter}>
            <Typography variant="body2">{getAmount(day.total, true)}</Typography>
          </Box>
        </>)}
        </Box>
      ))}
      {!weeklyView && <Box gridColumn={`span ${6 - endDay}`} sx={styles.dayBoxEmpty}></Box>}
    </>
  )
}