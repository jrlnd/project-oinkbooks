import type { User } from "firebase/auth";
import { createContext } from "react";

export type UserContextType = {
  authUser: User | null | undefined,
  authUsername: string | null | undefined
  loading: boolean,
  error: any
}

export const UserContext = createContext<UserContextType>({ authUser: null, authUsername: null, loading: true, error: null})