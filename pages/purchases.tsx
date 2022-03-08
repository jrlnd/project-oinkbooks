/* eslint-disable react-hooks/exhaustive-deps */
import { ReactElement, useContext, useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { format } from "date-fns"
import toast from "react-hot-toast"

import { Box, Button, CircularProgress, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material"
import { ChevronLeft, ChevronRight, Today } from "@mui/icons-material"

import { getCategoryIcon } from "../lib/categories"
import { AddNewDialog, Calendar, DatePickerDialog, Layout, MetaTags, TransactionsChart, TransactionsTable } from "../components"
import { UserContext } from "../lib/context"
import { firestore, purchaseToJSON } from "../lib/firebase"
import { CategoryDetails, PurchaseDetails } from "../models"

const PurchasesPage = () => {
  
  const { authUser, loading } = useContext(UserContext)

  const [calDate, setCalDate] = useState<Date>(new Date());

  // const dateFrom = new Date(calYear, calMonth, weeklyView ? calDate.getDate() - calDate.getDay() : 1)
  // const dateTo = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), weeklyView ? dateFrom.getDate() + 6 : numDays);
  // on the dashboard, dateFrom should be a Sunday / dateTo should be the next 6 days from dateFrom
  const dateFrom = useMemo(() => new Date(calDate.getFullYear(), calDate.getMonth(), 1), [calDate]) 
  const numDays = useMemo(() => new Date(dateFrom.getFullYear(), dateFrom.getMonth() + 1, 0).getDate(), [dateFrom])
  const dateTo = useMemo(() => new Date(dateFrom.getFullYear(), dateFrom.getMonth(), numDays, 23, 59, 59, 999), [dateFrom])
  
  // listen for changes for purchases
  const [purchases, setPurchases] = useState<PurchaseDetails[]>([])
  useEffect(() => {
    const purchasesCollection = collection(firestore, 'users', authUser!.uid, 'purchases')
    const purchasesQuery = query( purchasesCollection, where('date', '>=', dateFrom), where('date', '<=', dateTo), orderBy('date', 'desc') )
    const unsubscribe = onSnapshot(purchasesQuery, (querySnapshot) => {
      const purchasesData = querySnapshot.docs.map(purchaseToJSON)
      setPurchases(purchasesData)
    });

    return () => unsubscribe()
  }, [dateFrom, dateTo])

  // listen for changes for categories
  const [categories, setCategories] = useState<CategoryDetails[]>([])
  useEffect(() => {
    const categoryCollection = collection(firestore, 'users', authUser!.uid, 'categories')
    const unsubscribe = onSnapshot(categoryCollection, (querySnapshot) => {
      const categoryData = querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id} as CategoryDetails))
      setCategories(categoryData)
    });

    return () => unsubscribe()
  }, [])

  let content: {
    date: Date,
    items: PurchaseDetails[],
    total: number
  }[] = []

  for (let day = 0; day < numDays; day++) {
    const detailsDate = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate() + day)
    // find the purchases for this day
    const detailsPurchases = purchases.filter(({ date }) => date.getFullYear() === detailsDate.getFullYear() && date.getMonth() === detailsDate.getMonth() && date.getDate() === detailsDate.getDate()) || []
    // Add category icon field to purchase details
    const items = detailsPurchases.map((purchase) => ({...purchase, categoryIcon: getCategoryIcon(categories, purchase.category)}))
    content.push({
      date: detailsDate,
      items: items,
      total: items.map(item => item.amount).reduce((prev, curr) => prev + curr, 0) + (day > 0 ? content[day-1].total : 0)
    })
  }
  
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLButtonElement | null>(null)

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
    const newDate = new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1)

    if (newDate.getFullYear() < 2022) {
      toast.error("Minimum date must be in the year 2022")
    } else {
      setCalDate(newDate)
    }
  }

  const handleNextButton = () => {
    const newDate = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1)

    if (newDate.getMonth() > new Date().getMonth()) {
      toast.error("Cannot set date to the future")
    } else {
      setCalDate(newDate)
    }
  }


  return (<>
    <MetaTags subtitle="Purchases" />
    
    {loading ? <CircularProgress /> :
    (<>

        <Stack direction={{xs: 'column', md: 'row'}} spacing={1} alignItems="center" justifyContent="space-between" mb={2}>
          <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold' }}>
            Monthly Purchases
          </Typography> 
          <AddNewDialog uid={authUser!.uid} categories={categories} />
        </Stack>


        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          {calDate.getFullYear() <= new Date().getFullYear() && calDate.getMonth() <= 0 ? (
            <Tooltip title="Minimum date must be in the year 2022" followCursor>
              <span>
                <IconButton disabled size="large" color="default"><ChevronLeft /></IconButton>
              </span>
            </Tooltip>
          ) : (
            <IconButton size="large" color="default" aria-label="Go to previous month" onClick={handlePrevButton}><ChevronLeft /></IconButton>
          )}
          <Button variant="text" size="large" color="inherit" sx={{ fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }} endIcon={<Today/>} onClick={(e) => handleOpenDatePicker(e)}>
            {format(calDate, 'MMMM yyyy')}{" "} 
          </Button>
          {calDate.getFullYear() === new Date().getFullYear() && calDate.getMonth() === new Date().getMonth() ? (
          <Tooltip title="Cannot view dates in the future" followCursor>
            <span>
              <IconButton disabled size="large" color="default"><ChevronRight /></IconButton>
            </span>
          </Tooltip>
          ) : (
          <IconButton size="large" color="default" aria-label="Go to next month" onClick={handleNextButton}><ChevronRight /></IconButton>
          )}
        </Stack>


        <Box mb={4}>
          <TransactionsTable enableEdit uid={authUser!.uid} categories={categories} purchases={purchases} numOfRows={25} autoHeight={true} />
        </Box>
          
        <Box mb={4}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Total Purchases by Category
          </Typography> 
          <TransactionsChart categories={categories} data={purchases} verticalAlign="middle" horizontalAlign="right" layout="vertical" />
        </Box>    


        <DatePickerDialog open={datePickerOpen} anchorEl={datePickerAnchor} selectedDate={calDate} onClose={handleCloseDatePicker} />
    </>)}
  </>)
}
export default PurchasesPage


PurchasesPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>

