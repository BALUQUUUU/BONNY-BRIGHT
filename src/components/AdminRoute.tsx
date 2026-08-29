import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useApp()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/home" replace />
  return children
}

export default AdminRoute
