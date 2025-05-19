
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create auth context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
