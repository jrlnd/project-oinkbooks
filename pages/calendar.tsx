/* eslint-disable react-hooks/exhaustive-deps */
import { ReactElement, useContext, useEffect, useMemo, useState } from "react"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"

import { CircularProgress, Stack, Typography } from "@mui/material"

import { getCategoryIcon } from "../lib/categories"
import { AddNewDialog, Calendar, Layout, MetaTags } from "../components"
import { UserContext } from "../lib/context"
import { firestore, purchaseToJSON } from "../lib/firebase"
import { CategoryDetails, PurchaseDetails } from "../models"


const CalendarPage = () => {
  
  const { authUser, loading } = useContext(UserContext)

  const [calDate, setCalDate] = useState<Date>(new Date());

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


  return (<>
    <MetaTags subtitle="Calendar" />
    
    {loading ? <CircularProgress /> :
    (<>

        <Stack direction={{xs: 'column', md: 'row'}} spacing={1} alignItems="center" justifyContent="space-between" mb={2}>
          <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold' }}>
            Calendar
          </Typography> 
          <AddNewDialog uid={authUser!.uid} categories={categories} />
        </Stack>

        <Calendar calDate={calDate} setCalDate={setCalDate} dateFrom={dateFrom} dateTo={dateTo} content={content}/>
    </>)}
  </>)
}
export default CalendarPage


CalendarPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>

