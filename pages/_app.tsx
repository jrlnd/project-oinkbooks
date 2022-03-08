import '../styles/globals.css'
import type {  ReactElement, ReactNode } from 'react'
import type { AppProps } from 'next/app'
import { NextPage } from 'next'
import { Toaster } from 'react-hot-toast'
import { createTheme, ThemeProvider, responsiveFontSizes } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { PrivateRoute } from '../components'
import { UserContext } from '../lib/context'
import { useUserData } from '../lib/hooks'


let theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        sizeLarge: {
          lineHeight: 'normal',
          padding: '12px 18px 8px',
        },
        startIcon: {
          marginLeft: '-8px',
          marginRight: '8px',
          marginTop: '-2px',
        },
        endIcon: {
          marginRight: '-8px',
          marginLeft: '8px',
          marginTop: '-4px',
        }
      }
    }
  },
  palette: {
    primary: {
      main: '#4ca2cd',
      contrastText: '#fff'
    },
    secondary: {
      main: '#67B26F',
      contrastText: '#fff'
    },
  },
  typography: {
    fontFamily: 'League Spartan',
  },
})

theme = responsiveFontSizes(theme)

type NextPageWithLayout = NextPage & {
  getLayout? : (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const userData = useUserData()

  const protectedRoutes = ['/dashboard', '/purchases', '/reports']
  
  const getLayout = Component.getLayout ?? ((page) => page)

  return (
    
    <UserContext.Provider value={userData}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PrivateRoute protectedRoutes={protectedRoutes}>
          {getLayout(<Component {...pageProps} />)}
        </PrivateRoute>
        <Toaster />
      </ThemeProvider>  
    </UserContext.Provider>
  )
}

export default MyApp
