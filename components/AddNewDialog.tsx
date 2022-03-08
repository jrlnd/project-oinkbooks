import { useState } from "react"

import { addDoc, collection } from "firebase/firestore"
import { Controller, SubmitErrorHandler, SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material"
import { Add, Close } from "@mui/icons-material"
import { DatePicker, LocalizationProvider } from "@mui/lab"
import AdapterDateFns from "@mui/lab/AdapterDateFns"

import { firestore } from "../lib/firebase"
import { CategoryDetails, PurchaseDetails } from "../models"

type AddNewDialogProps = {
  uid: string,
  categories: CategoryDetails[]
}

const AddNewDialog = ({ uid, categories }: AddNewDialogProps) => {
  
  const [openFormDialog, setOpenFormDialog] = useState(false)

  const handleOpenDialog = () => { 
    setOpenFormDialog(true)
  }

  const handleCloseDialog = () => { 
    setOpenFormDialog(false)
  }

  return (
    <>
      <Button size="large" color="secondary" variant="contained" disableElevation startIcon={<Add />} onClick={handleOpenDialog}>
        Add New Purchase
      </Button>

      <FormDialog uid={uid} open={openFormDialog} onClose={handleCloseDialog} categories={categories} />
    </>
  )
}
export default AddNewDialog

type FormDialogProps = {
  uid: string,
  open: boolean,
  onClose: () => void,
  categories: CategoryDetails[]
}

const FormDialog =  ({ uid, open, onClose, categories }: FormDialogProps) => {

  const defaultForm: PurchaseDetails = {
    purchase: "",
    description: "",
    category: "",
    date: new Date(),
    amount: 0.00
  }

  const [defaultFormValues, setDefaultFormValues] = useState<PurchaseDetails>(defaultForm)

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

      const ref = collection(firestore, 'users', uid, 'purchases')
      await addDoc(ref, formData);
      toast.success('Purchase has been added')
      reset()
      onClose()
    } catch(error) {
      console.error((error as Error).message)
      toast.error((error as Error).message)
    }

  };

  const onError: SubmitErrorHandler<PurchaseDetails> = (errors) => {
    toast.error("Your purchase data is invalid. Try again.")
    console.error(errors)
  }

  return (
    <Dialog open={open} onClose={onClose}>
    <DialogTitle>
      Add New Purchase
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
        defaultValue={defaultFormValues.purchase}
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
        defaultValue={defaultFormValues.category}
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
          defaultValue={defaultFormValues.amount}
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
          defaultValue={defaultFormValues.date}
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
        defaultValue={defaultFormValues.description || ""}
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
      <Button size="large" color="inherit" variant="contained" disableElevation fullWidth onClick={() => reset()}>Clear</Button>
      <Button size="large" color="primary" variant="contained" disableElevation fullWidth type="submit">Add</Button>
    </DialogActions>
    </form>
  </Dialog>
  )
}