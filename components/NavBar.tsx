import { useState } from "react";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth"

import { AppBar, Box, Button, Container, IconButton, ListItemIcon, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import { Today, ChevronRight, Dashboard, ReceiptLong, Menu as MenuIcon } from '@mui/icons-material'
import { PiggyBank } from './svg';

import { auth } from "../lib/firebase"

const pages = [
  {page: 'Dashboard', url: '/dashboard', icon: <Dashboard fontSize="small" />}, 
  {page: 'Purchases', url: '/purchases', icon: <ReceiptLong fontSize="small" />},
  {page: 'Calendar', url: '/calendar', icon: <Today fontSize="small" />}
];

const NavBar = () => {

  const router = useRouter()

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (url?: string) => {
    if (url)
      router.push(url)
    setAnchorElNav(null);
  };

  const handleSignOut = async () => {
    await signOut(auth)
    await router.push('/')
  }


  return (
    <AppBar position="fixed" elevation={2} sx={{height: {xs: '3.75rem', md: '4.5rem'}}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            <PiggyBank  styles={{ width: '36px', fill: 'white' }} fill="white" />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={() => handleCloseNavMenu()}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map(({page, url, icon}) => (
                <MenuItem key={page} onClick={() => handleCloseNavMenu(url)}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
          >
            <PiggyBank  styles={{ width: '36px', fill: 'white' }} fill="white" />
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map(({page, url, icon}) => (
              <Button
                key={page}
                size="large"
                onClick={() => handleCloseNavMenu(url)}
                sx={{ my: 2, color: 'white' }}
                startIcon={icon}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Button variant="text" size="large" sx={{ color: 'white' }} onClick={handleSignOut} endIcon={<ChevronRight/>}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default NavBar;
