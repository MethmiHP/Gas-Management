import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Delivery from './components/deliveryManagement/pages/DeliveryPage'
import Driver from './components/deliveryManagement/pages/DriverPage'
import AddDriver from './components/deliveryManagement/pages/AddDriver'
import DashboardPage from './components/deliveryManagement/pages/DashboardPage'
import Layout from './components/deliveryManagement/pages/Layout'
import Driverperformance from './components/deliveryManagement/pages/DeliveryPerformanceReport'
import DeliveryDetails from './components/deliveryManagement/pages/DeliveryDetails'
import TrackingOrder from './components/deliveryManagement/pages/TrackDeliveryPage'
import DriverDashboard from './components/deliveryManagement/pages/DriverDashboard';
import DeliveryForm from './components/deliveryManagement/pages/DeliveryForm'; 
import Home from './components/deliveryManagement/pages/Home'
import Driverlayout from './components/deliveryManagement/pages/Driver_layout'
import ProductPage from './components/inventoryManagement/pages/ProductPage'
import AdminProductManagement from './components/inventoryManagement/pages/AdminProductManagement'
import ComplaintPage from "./components/customerSupport/pages/ComplaintPage";
import SupporterPage from "./components/customerSupport/pages/SupporterPage";
import OrderController from './components/orderManagement/OrderController'
import CartController from './components/orderManagement/CartController'
import PaymentPortal from './components/orderManagement/paymentController'
import CustomerDashboard from './components/userManagement/pages/CustomerDashboard';
import AdminDashboard from './components/userManagement/pages/AdminDashboard';
import Login from './components/userManagement/pages/Login';
import Register from './components/userManagement/pages/Register';
import EditProfile from './components/userManagement/pages/EditProfile';
import ChangePassword from './components/userManagement/pages/ChangePassword';
import ProductsPage from './components/productDisplay/ProductsPage';
import PaymentPage from './components/orderManagement/PaymentPage'; // Add this import
import ViewAllDeliveries from './components/deliveryManagement/pages/ViewAllDeliveries'; // Add this import
import ProtectedRoute from './components/userManagement/ProtectedRoute';
import { AuthProvider } from './components/userManagement/context/AuthContext';
import OrderDetailsPage from './components/orderManagement/OrderDetailsPage'; // Add this import
import DeliveryProgress from './components/deliveryManagement/pages/DeliveryProgressTracker';

function App() {
  const [count, setCount] = useState(0)

  return (
    <AuthProvider>
      <Router>
        <div>
          <ToastContainer position="top-right" autoClose={3000} />
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:category" element={<ProductsPage />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <CartController />
              </ProtectedRoute>
            } />
            
            <Route path="/delivery-form" element={
              <ProtectedRoute>
                <DeliveryForm />
              </ProtectedRoute>
            } />
            
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            
            
            <Route path="/order/:orderId" element={<OrderDetailsPage />} /> {/* Add this line */}
            
            {/* User management routes outside of Layout */}
            <Route path="/progress" element={<DeliveryProgress />} /> 
            <Route path="/track" element={<TrackingOrder />} />
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/driver/dashboard" element={<DriverDashboard />} /> {/* Add this line */}
            <Route path="/admin/dashboard/inventory" element={
              <ProtectedRoute roles={['admin']}>
                <AdminProductManagement />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={<EditProfile />} />
            <Route path="/change-password" element={<ChangePassword />} />
            
            {/* Admin routes with role protection */}
            <Route path="/admin/products" element={
              <ProtectedRoute roles={['admin']}>
                <AdminProductManagement />
              </ProtectedRoute>
            } />
            
            {/* All other routes within the layout */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="admin/products" element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminProductManagement />
                    </ProtectedRoute>
                  } />
                  <Route path="inventory" element={
                    <ProtectedRoute>
                      <AdminProductManagement />
                    </ProtectedRoute>
                  } />

                   <Route path="/view-all-deliveries" element={<ViewAllDeliveries />} /> {/* Add this line */}
                  <Route path="driver-layout" element={<Driverlayout />} />
                  <Route path="deliveries" element={<Delivery />} />
                  <Route path="driver-performance-report" element={<Driverperformance />} />
                  <Route path="drivers" element={<Driver />} />
                  <Route path="add-driver" element={<AddDriver />} />
                  
                  <Route path="delivery/:id" element={<DeliveryDetails />} />
                  <Route path="driver-dashboard" element={< DriverDashboard/>} />
                  <Route path="orders" element={<OrderController />} />
                  <Route path="cart" element={<CartController />} />
                  <Route path="payment" element={<PaymentPortal />} />
                  <Route path="product" element={<ProductPage />} />
                  <Route path="customer-support/complaints" element={<ComplaintPage />} />
                  <Route path="customer-support/complaints/supporter" element={<SupporterPage />} />
                  <Route path="add-delivery" element={<DeliveryForm />} />
                  <Route path="home" element={<Home />} />
                  <Route path="payment" element={<PaymentPage />} /> {/* Add this inside layout as well */}
                </Routes>
              </Layout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App











































































































































