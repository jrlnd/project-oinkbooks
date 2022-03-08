import { FC } from "react"
import { Container } from "@mui/material" 
import { NavBar, AuthCheck } from "."

const Layout: FC = ({ children }) => {
  return (
    <AuthCheck>
      <NavBar />
      <Container maxWidth="xl" sx={{ backgroundColor: '#f0f0f0', minHeight: '100vh', px: {md: 8}, pt: {xs: 10, md: 14}, pb: 2 }}>
        {children}
      </Container>
    </AuthCheck>
  )
}
export default Layout