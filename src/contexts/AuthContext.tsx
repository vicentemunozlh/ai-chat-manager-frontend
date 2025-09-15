import { createContext, useReducer, useEffect, type ReactNode } from 'react'
import { apiRequest } from '../utils'
import type { LoginCredentials, AuthResponse, AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshAuthToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN'; payload: { accessToken: string } }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.token,
        refreshToken: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGIN_FAILURE':
      return { ...state, isLoading: false }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    case 'REFRESH_TOKEN':
      return { ...state, accessToken: action.payload.accessToken }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing tokens on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')
      const userStr = localStorage.getItem('user')

      if (accessToken && refreshToken && userStr) {
        try {
          // Validate token with backend
          const userData = await apiRequest('/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          })

          // If successful, restore the session
          const user = JSON.parse(userStr)
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token: accessToken,
              user: userData.user || user, // Use fresh user data from backend
              expires_in: 3600,
            },
          })
        } catch (error) {
          console.error('Token validation failed:', error)
          // Clear invalid tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
        }
      }
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' })

    try {
      const data: AuthResponse = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      console.log('Login data:', data)

      // Store tokens and user data
      localStorage.setItem('access_token', data.token)
      localStorage.setItem('refresh_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      dispatch({ type: 'LOGIN_SUCCESS', payload: data })
    } catch (error) {
      console.error('Error logging in:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token')
    if (!refreshTokenValue) {
      logout()
      return
    }

    try {
      const data = await apiRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      })

      localStorage.setItem('access_token', data.access_token)
      dispatch({ type: 'REFRESH_TOKEN', payload: { accessToken: data.access_token } })
    } catch (error) {
      console.error('Error refreshing token:', error)
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshAuthToken: refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

// Export the context for the hook
export { AuthContext }
