/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { useContext, useEffect } from "react"
import { UserContext } from "../lib/context"
import { Container, CircularProgress } from "@mui/material";

const PrivateRoute = ({ protectedRoutes, children }: any) => {
  const router = useRouter()
  const { authUsername, loading } = useContext(UserContext)

  const isProtected = protectedRoutes.indexOf(router.pathname) !== -1

  useEffect(() => {
    if (!authUsername && !loading && isProtected) {
      router.push('/')
    }
  }, [authUsername, loading, isProtected])

  if ((loading || !authUsername) && isProtected) {
    return (
      <Container maxWidth="xl" sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <CircularProgress color="inherit" />
      </Container>
    )      
  }

  return children
}

export default PrivateRoute