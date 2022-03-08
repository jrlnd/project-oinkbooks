import Link from 'next/link';
import { useContext } from 'react';
import { Container, CircularProgress } from "@mui/material";
import { UserContext } from '../lib/context';

// Component's children only shown to logged-in users
export const AuthCheck = ({ children, fallback }: any) => {
  const { authUser } = useContext(UserContext);

  return authUser ? children : fallback || (
      <Container maxWidth="xl" sx={{ minHeight: '100vh', display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress color="inherit" />
      </Container>
    )     
}

export default AuthCheck