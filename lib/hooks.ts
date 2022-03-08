import { doc, onSnapshot } from 'firebase/firestore'
import { auth, firestore } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material';
import toast from 'react-hot-toast';

export const useUserData = () => {
  const [user, loading, error] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {

    try {
      if (user) {
        const ref = doc(firestore, 'users', user.uid);
        const unsubscribe = onSnapshot(ref, (doc) => {
          setUsername(doc.data()?.username);
        });

        return () => unsubscribe();
      } else {
        setUsername(null);
      }
    } catch(error) {
      console.error((error as Error).message)
      toast.error((error as Error).message)
    }
  }, [user]);

  return { authUser: user, authUsername: username, loading, error };
}

export const useBreakPoints = () => {

  const breakpoints = {
    xsScreen: useMediaQuery((theme: Theme) => theme.breakpoints.up('xs')),
    smScreen: useMediaQuery((theme: Theme) => theme.breakpoints.up('sm')),
    mdScreen: useMediaQuery((theme: Theme) => theme.breakpoints.up('md')),
    lgScreen: useMediaQuery((theme: Theme) => theme.breakpoints.up('lg')),
    xlScreen: useMediaQuery((theme: Theme) => theme.breakpoints.up('xl')),
  }

  return breakpoints
}