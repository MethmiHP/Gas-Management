import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import OrderController from './components/orderManagement/OrderController'
import CartController from './components/orderManagement/CartController'
import PaymentPortal from './components/orderManagement/paymentController'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/payment">Payment</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/orders" element={<OrderController />} />
          <Route path="/cart" element={<CartController />} />
          <Route path="/" element={<CartController />} />
          <Route path="/payment" element={<PaymentPortal />} />
          <Route path="/" element={<div>Welcome! Please select Orders or Cart from the navigation.</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App