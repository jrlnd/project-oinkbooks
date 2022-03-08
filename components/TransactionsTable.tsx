/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"

import { format } from "date-fns"
import { deleteDoc, doc, setDoc } from "firebase/firestore"
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form'
import toast from "react-hot-toast"

import {
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  InputAdornment,
  Box,
} from "@mui/material";
import { Close, DeleteForever, Edit } from "@mui/icons-material"
import { DatePicker, LocalizationProvider } from "@mui/lab"
import AdapterDateFns from "@mui/lab/AdapterDateFns"
import { DataGrid, GridColDef, GridRenderCellParams, GridValueFormatterParams } from "@mui/x-data-grid"

import { CategoryDetails, PurchaseDetails } from "../models"
import { getCategoryIcon, getCategoryLabel } from "../lib/categories"
import { firestore } from "../lib/firebase"


const formatAmount = (amount: number) => (new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount))

type TransactionsTableProps = {
  enableEdit?: boolean,
  title?: string,
  uid: string,
  categories: CategoryDetails[],
  purchases: PurchaseDetails[],
  numOfRows?: number,
  autoHeight?: boolean
}

const TransactionsTable = ({  enableEdit = false, title, uid, categories, purchases, numOfRows=5, autoHeight=false }: TransactionsTableProps) => {

  const getPurchaseData = (purchaseId: string) => purchases.find(({id}) => id === purchaseId)

  const defaultForm: PurchaseDetails = {
    purchase: "",
    description: "",
    category: "",
    date: new Date(),
    amount: 0.00
  }
  
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [editValues, setEditValues] = useState<PurchaseDetails>(defaultForm)

  const handleOpenEditDialog = (purchaseId: string) => {
    const purchases = getPurchaseData(purchaseId)
    if (purchases) {
      setEditValues(purchases)
      setOpenEditDialog(true)
    } else {
      toast.error("Error: Cannot find purchase data")
    }
  }

  const handleCloseEditDialog = () => { 
    setOpenEditDialog(false) 
  }

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [deleteData, setDeleteData] = useState<PurchaseDetails | null>(null)

  const handleOpenDeleteDialog = (purchaseId: string) => {
    const purchases = getPurchaseData(purchaseId)
    if (purchases) {
      setDeleteData(purchases)
      setOpenDeleteDialog(true)
    } else {
      toast.error("Purchase data cannot be found")
    }
  }

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false)
  }


  const columns: GridColDef[] = [
    { field: 'date',
      type: 'date',
      editable: true,
      headerName: 'Date',
      width: 100,
      valueFormatter: (params: GridValueFormatterParams) => (
        format(params.value as Date, 'MMM dd')
      )
    },
    {
      field: 'purchase',
      headerName: 'Purchase',
      flex: 1.25,
    },
    {
      field: 'category',
      headerName: 'Category',
      flex: 1,      
      valueFormatter: (params: GridValueFormatterParams) => (
        getCategoryLabel(categories, params.value as string)
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
    },

    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      width: 100,
      valueFormatter: (params: GridValueFormatterParams) => (
       formatAmount(params.value as number)
      ),
    }
  ]

  if (enableEdit) {
    columns.push({
      field: 'id',
      headerName: 'Actions',
      width: 100,
      headerAlign: "right",
      align: "right", 
      renderCell: (params: GridRenderCellParams) => {
        const purchaseId = params.value
        return (
          <>
            <IconButton aria-label="edit" size="small" onClick={() => handleOpenEditDialog(purchaseId)}>
              <Edit fontSize="small"/>
            </IconButton>
            <IconButton aria-label="edit" size="small" onClick={() => handleOpenDeleteDialog(purchaseId)}>
              <DeleteForever fontSize="small"/>
            </IconButton>
          </>
        )
      },
    })
  }


  return (
    <Box>
      {title && (<Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>)}
      <Table rows={purchases} columns={columns} numOfRows={numOfRows} autoHeight={autoHeight} />
      {enableEdit && (
        <>
          <EditDialog uid={uid} open={openEditDialog} onClose={handleCloseEditDialog} editValues={editValues} categories={categories} />
          <DeleteDialog uid={uid} deleteData={deleteData} open={openDeleteDialog} onClose={handleCloseDeleteDialog} categories={categories} />
        </>
      )}
      
    </Box>
  )
}
export default TransactionsTable

type TableProps = {
  rows: PurchaseDetails[],
  columns: GridColDef[],
  numOfRows: number,
  autoHeight: boolean,
}

const Table = ({ rows, columns, numOfRows, autoHeight }: TableProps) => {
  return (
    <Paper sx={{p: 2, width: '100%' }} elevation={0}>
      <div style={{ height: autoHeight ? "auto" : 400, width: '100%' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ flexGrow: 1 }}>
            <DataGrid
              autoHeight={autoHeight}
              rows={rows}
              columns={columns}
              pageSize={numOfRows}
              rowsPerPageOptions={[numOfRows]}
              disableSelectionOnClick
              disableColumnMenu
            />
          </div>
        </div>
      </div>
    </Paper>
  )
}

type EditDialogProps = {
  uid?: string,
  open: boolean,
  onClose: () => void,
  editValues: PurchaseDetails,
  categories: CategoryDetails[],
}

const EditDialog = ({ uid, open, onClose, editValues, categories }: EditDialogProps) => {

  const [defaultValues, setDefaultValues] = useState(editValues)

  useEffect(() => {
    setDefaultValues(editValues)
    reset()
  }, [editValues])

  const { handleSubmit, control, reset, formState: { dirtyFields, errors } } = useForm<PurchaseDetails>()

  const onSubmit: SubmitHandler<PurchaseDetails> = async (data, e) => {
    // make sure to round any decimals of the amount
    const formData = {
      ...data, 
      amount: parseFloat(new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(data.amount))
    }

    try {
      if (!uid)
        throw new Error("User ID cannot be found")

      if (dirtyFields && Object.keys(dirtyFields).length === 0)
        throw new Error("No data has been edited")

      const purchaseId = defaultValues.id
      if (!purchaseId) 
        throw new Error("Purchase ID cannot be found")

      const ref = doc(firestore, 'users', uid, 'purchases', purchaseId)
      await setDoc(ref, formData)
      toast.success('Purchase has been edited')
      reset()
      onClose()
    } catch(error) {
      console.error((error as Error).message)
      toast.error((error as Error).message)
    }

  }

  const onError: SubmitErrorHandler<PurchaseDetails> = (errors) => {
    toast.error("Your purchase data is invalid. Try again.")
    console.error(errors)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Edit Purchase
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>

      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
      <DialogContent>
        <Controller
          name="purchase"
          defaultValue={defaultValues.purchase}
          control={control}
          rules={{ required: true, maxLength: 80 }}
          render={({ field }) => (
            <TextField
              autoFocus margin="dense" label="Purchase" type="text" fullWidth
              variant="outlined"
              error={errors.purchase ? true : false}
              helperText={errors.purchase ? errors.purchase.type === "maxLength" ? "Purchase label is too long" : "Purchase title is required" : "" }
              { ...field }
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          defaultValue={defaultValues.category}
          rules={{ required: true }}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={errors.category ? true : false}>
            <InputLabel id="caetgory-select-label">Category</InputLabel>
            <Select
              labelId="category-select-label"
              label="Category"
              {...field}
            >
              {categories.map(({id, icon, label}, i) => (
                <MenuItem key={id} value={id}>
                  <Typography variant="body1">
                    {icon} {label}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{errors.category?.type === 'required' && "Category is required" }</FormHelperText>
          </FormControl>
          )}
        />
        
        <Stack direction={{xs: 'column', md: 'row'}} spacing={2.5} mt={1.5} mb={0.5} alignItems="center" justifyContent="between">
          <Controller
            name="amount"
            control={control}
            defaultValue={defaultValues.amount}
            rules={{ required: true, min: 0 }}
            render={({ field }) => (
              <TextField
                label="Amount"
                type="number"
                fullWidth
                error={errors.amount ? true : false}
                helperText={errors.amount ? errors.amount.type === "min" ? "Amount must be greater than 0" : "Amount is required" : "" }
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                variant="outlined"
                { ...field }
              />
            )}
          />
          <Controller
            name="date"
            control={control}
            defaultValue={defaultValues.date}
            rules={{ required: true, }}
            render={({ field }) => (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  disableFuture
                  label="Purchase Date"
                  {...field}
                  renderInput={(params) => (
                    <TextField 
                      fullWidth required {...params}
                      error={errors.date ? true : false}
                      helperText={errors.date?.type === 'required' && "Date is required" }
                    />
                  )}
                />
              </LocalizationProvider>
            )}
          />
        </Stack>

        <Controller
          name="description"
          control={control}
          defaultValue={defaultValues.description || ""}
          render={({ field }) => (
            <TextField
              margin="normal"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              {...field}
            />
          )}
        />
        
      </DialogContent>
      <DialogActions sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button size="large" color="inherit" variant="contained" disableElevation fullWidth onClick={() => reset()}>Reset Changes</Button>
        <Button size="large" color="primary" variant="contained" disableElevation fullWidth type="submit">Save</Button>
      </DialogActions>
      </form>
    </Dialog>
  )
}

type DeleteDialogProps = {
  uid?: string,
  deleteData: PurchaseDetails | null,
  open: boolean,
  categories: CategoryDetails[],
  onClose: () => void
}

const DeleteDialog = ({ uid, deleteData, open, onClose, categories }: DeleteDialogProps) => {

  const handleDelete = async () => {

    try {
      if (!uid)
        throw new Error("User ID cannot be found")

      const purchaseId = deleteData?.id
      if (!purchaseId)
        throw new Error("Purchase ID cannot be found")
      
      const ref = doc(firestore, 'users', uid, 'purchases', purchaseId);
      await deleteDoc(ref)
      toast.success("Purchase has been deleted")
      onClose()
    } catch(error) {
      console.error((error as Error).message)
      toast.error((error as Error).message)
    }

  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Delete This Purchase?
      </DialogTitle>
      <DialogContent>
        <Typography component="p" variant="body1" mb={2}>Are you sure you want to delete this purchase? <b>This action cannot be undone.</b></Typography>
        {deleteData && (
          <>
            <Typography variant="subtitle2" sx={{textTransform: 'uppercase'}}>{format(deleteData.date, 'PPPP')}</Typography>
            <Typography variant="h6">{getCategoryIcon(categories, deleteData.category)} {deleteData.purchase} ({formatAmount(deleteData.amount)})</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button size="large" color="inherit" variant="contained" disableElevation fullWidth onClick={onClose}>Cancel</Button>
        <Button size="large" color="error" variant="contained" disableElevation fullWidth onClick={handleDelete}>Delete</Button>
      </DialogActions>
    </Dialog>
  )

}