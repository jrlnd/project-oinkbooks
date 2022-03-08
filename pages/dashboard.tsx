/* eslint-disable react-hooks/exhaustive-deps */
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";

import { collection, where, query, orderBy, onSnapshot } from "firebase/firestore"

import { Box, CircularProgress, Stack, Typography, } from "@mui/material";

import { MetaTags, Calendar, Layout, TransactionsTable, TransactionsChart, AddNewDialog } from "../components";
import { PurchaseDetails, CategoryDetails } from "../models";
import { firestore, purchaseToJSON } from "../lib/firebase";
import { UserContext } from "../lib/context";
import { getCategoryIcon } from "../lib/categories";

const DashboardPage = () => {

  const { authUser, authUsername, loading } = useContext(UserContext)

  const [calDate, setCalDate] = useState<Date>(new Date());

  // on the dashboard, dateFrom should be a Sunday / dateTo should be the next 6 days from dateFrom
  const dateFrom = useMemo(() => new Date(calDate.getFullYear(), calDate.getMonth(), calDate.getDate() - calDate.getDay()), [calDate]) 
  const dateTo = useMemo(() => new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate() + 6, 23, 59, 59, 999), [dateFrom])
 
  // listen for changes for purchases
  const [purchases, setPurchases] = useState<PurchaseDetails[]>([])
  useEffect(() => {
    const purchasesCollection = collection(firestore, 'users', authUser!.uid, 'purchases')
    const purchasesQuery = query( purchasesCollection, where('date', '>=', dateFrom), where('date', '<=', dateTo), orderBy('date', 'asc') )
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

  for (let day = 0; day < 7; day++) {
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
  
  return (
    <>
      <MetaTags subtitle="Dashboard"  />
      
      {loading ? <CircularProgress /> :
      (<>

        <Stack direction={{xs: 'column', md: 'row'}} spacing={1} alignItems="center" justifyContent="space-between" mb={4}>
          <Typography component="h1" variant="h3" sx={{ fontWeight: 'bold' }}>
            Hello, {authUsername}
          </Typography>
          
          <AddNewDialog uid={authUser!.uid} categories={categories} />
        </Stack>
        
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Weekly Overview
        </Typography> 
        <Calendar calDate={calDate} setCalDate={setCalDate} dateFrom={dateFrom} dateTo={dateTo} weeklyView={true} content={content}/>

        <Box pb={2} sx={{ width: '100%', display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gridTemplateRows: {xs: 'auto auto', md: '1fr'}, columnGap: {xs: 0, md: 4}, rowGap: {xs: 4, md: 0}}}>
          <TransactionsTable title="Recent Purchases" uid={authUser!.uid} categories={categories} purchases={purchases} />
          <TransactionsChart title="Total Purchases" data={purchases} categories={categories} />
        </Box>
      </>)}
    </>
  )
}
export default DashboardPage


DashboardPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>

