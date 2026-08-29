import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useApp()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
