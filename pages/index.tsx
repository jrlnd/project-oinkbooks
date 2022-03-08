
import { useContext, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/router";

import { signInWithEmailAndPassword } from "firebase/auth";
import toast from "react-hot-toast";

import { Box, Container, Paper, Stack, TextField, Typography, Button, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { MetaTags } from "../components";
import { PiggyBank } from "../components/svg"
import { UserContext } from "../lib/context";
import { auth } from "../lib/firebase";


const Home = () => {
  const router = useRouter()
  const { authUser, authUsername, loading } = useContext(UserContext)

  useEffect(() => {
    document.querySelector('body')?.classList.add('index-bg')
  }, [])

  useEffect(() => {
    if (authUsername)
      router.push(`/dashboard`)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUsername])


  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      // firebase signIn method should change the authUser and username
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <>
      <MetaTags />

      {!loading && !authUser && (
        <Container maxWidth="xl" sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Paper elevation={2} sx={{ width: '100%', maxWidth: '400px', p: 2, pt: 4 }} >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <PiggyBank styles={{ width: '100%', maxWidth: '96px', }} />
            </Box>
            
            <form onSubmit={handleLogin}>
            <Stack spacing={2} alignItems="center" justifyContent="center">

              <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold' }}>
                Welcome to Oinkbooks
              </Typography>

                <TextField type="email"
                  label="Email Address"
                  autoComplete="username"
                  required
                  variant="outlined"
                  fullWidth
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                />
                <TextField type={showPassword ? "text" : "password"} 
                  label="Password"
                  autoComplete="current-password"
                  required
                  variant="outlined"
                  fullWidth
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
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

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                  <Link href="/register" passHref>
                    <Button variant="contained" size="large" color="secondary" disableElevation sx={{ fontWeight: 'bold' }}>
                      Sign Up
                    </Button>
                  </Link>
                  <Button type="submit" variant="contained" size="large" disableElevation sx={{ fontWeight: 'bold' }}>
                    Login
                  </Button>
                </Stack>

            </Stack>
            </form>

          </Paper>
          
        </Container>
      )}
      
    </>
  );
};

export default Home;