/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link"
import { useRouter } from "next/router";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, writeBatch } from "firebase/firestore"
import debounce from 'lodash.debounce'
import { Box, Container, Paper, Stack, TextField, Typography, Button, InputAdornment, IconButton } from "@mui/material";
import { ChevronLeft, Visibility, VisibilityOff } from "@mui/icons-material";

import { PiggyBank } from "../components/svg"
import { UserContext } from "../lib/context";
import { auth, firestore } from "../lib/firebase";

const Register = () => {
  const router = useRouter()
  const { authUser, authUsername, loading } = useContext(UserContext)
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' })
  const [isUsernameValid, setIsUsernameValid] = useState(false)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState('')

  const defaultCategories = [
    {"icon": "🍔", "label": "Food"},
    {"icon": "🥦", "label": "Grocery"},
    {"icon": "💊", "label": "Health"},
    {"icon": "⭐", "label": "Miscellaneous"},
    {"icon": "🛒", "label": "Recreation"},
    {"icon": "🔁", "label": "Recurring"},
    {"icon": "🚗", "label": "Transportation"}
  ]

  useEffect(() => {
    if (!loading && authUser && authUsername)
      router.push('/dashboard')
  }, [loading, authUser, authUsername])
  
  const handleUsername = (inputValue: string) => {
    const usernameVal = inputValue.toLowerCase()
    const regex = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    if (usernameVal.length < 3) {
      setFormData({...formData, username: usernameVal})
      setUsernameLoading(false)
      setIsUsernameValid(false)
    }

    if (regex.test(usernameVal)) {
      setFormData({...formData, username: usernameVal})
      setUsernameLoading(true)
      setIsUsernameValid(false)
    }
  } 

  const checkUsername = useCallback(
    debounce( async (username: string) => {
      if (username.length >= 3) {
        const ref = doc(firestore, 'usernames', username)
        const snap = await getDoc(ref)
        setIsUsernameValid(!snap.exists())
        setUsernameLoading(false)
      }
    }, 1000)
  , [])

  useEffect(() => {
    checkUsername(formData.username);
  }, [formData.username]);

  useEffect(() => {
    if (usernameLoading) 
      setUsernameStatus("Checking...")
    else if (isUsernameValid)
      setUsernameStatus(`${formData.username} is available!`)
    else if (formData.username.length < 3 && formData.username.length > 0)
      setUsernameStatus("Username must be at least 3 characters long")
    else if (formData.username && !isUsernameValid)
      setUsernameStatus("That username is invalid and/or already taken")
  }, [formData.username, isUsernameValid, usernameLoading])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      const userDoc = doc(firestore, 'users', user?.uid)
      const usernameDoc = doc(firestore, 'usernames', formData.username)
      
      const batch = writeBatch(firestore)
      batch.set(userDoc, { username: formData.username})
      batch.set(usernameDoc, { uid: user!.uid })

      defaultCategories.forEach((category) => {
        const categoryDoc = doc(firestore, 'users', user?.uid, 'categories', category.label.toLowerCase())
        batch.set(categoryDoc, category)
      })

      await batch.commit()
      router.push(`/dashboard`)

    } catch (error) {
      console.error((error as Error).message)
    }
  }

  return (
    <Container maxWidth="xl" sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <Paper elevation={2} sx={{ width: '100%', maxWidth: '400px', p: 2, pt: 4 }} >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <PiggyBank styles={{ width: '100%', maxWidth: '96px', }} />
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ width: '100%', maxWidth: '400px'}} alignItems="center" justifyContent="center">

            <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
              Join Oinkbooks
            </Typography>
            
            <TextField type="text"
              label="Username"
              autoComplete="off"
              required
              variant="outlined"
              fullWidth
              onChange={(e) => handleUsername(e.target.value)}
              helperText={usernameStatus}
            />

            <TextField type="email"
              label="Email Address"
              autoComplete="username"
              required
              variant="outlined"
              fullWidth
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />

            <TextField type={showPassword ? "text" : "password"} 
              label="Password"
              autoComplete="current-password"
              required
              variant="outlined"
              fullWidth
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      onMouseDown={(e) => {e.preventDefault()}}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
  
            <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
              <Link href="/" passHref>
                <Button variant="outlined" size="large" color="secondary" disableElevation startIcon={<ChevronLeft />} sx={{ fontWeight: 'bold' }}>
                  Login
                </Button>
              </Link>

              <Button type="submit" variant="contained" size="large" disableElevation sx={{ fontWeight: 'bold' }}>
                Sign Up
              </Button>
            </Stack>

          </Stack>
        </form>
      </Paper>
      
    </Container>
  )
}
export default Register