import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import OnboardingFlow from './pages/Onboarding/OnboardingFlow'
import SkinProfile from './pages/SkinProfile'
import Home from './pages/Home'
import Shelf from './pages/Shelf'
import RoutineBuilder from './pages/RoutineBuilder'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import TrustCentre from './pages/TrustCentre'
import Journey from './pages/Journey'
import Discovery from './pages/Discovery'
import Subscription from './pages/Subscription'
import Checkout from './pages/Checkout'
import StoreLocator from './pages/StoreLocator'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

const App: React.FC = () => (
  <AppProvider>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/skin-profile"
          element={
            <ProtectedRoute>
              <SkinProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shelf"
          element={
            <ProtectedRoute>
              <Shelf />
            </ProtectedRoute>
          }
        />
        <Route
          path="/routine-builder"
          element={
            <ProtectedRoute>
              <RoutineBuilder />
            </ProtectedRoute>
          }
        />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/product/:id" element={<ProductDetail />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Checkout mode="cart" />} />
        <Route path="/trust" element={<TrustCentre />} />
        <Route
          path="/journey"
          element={
            <ProtectedRoute>
              <Journey />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <Discovery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route path="/stores" element={<StoreLocator />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  </AppProvider>
)

export default App
