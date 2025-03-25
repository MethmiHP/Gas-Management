

// import { useState } from 'react'
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import Delivery from './components/deliveryManagement/pages/DeliveryPage'
// import Driver from './components/deliveryManagement/pages/DriverPage'
// import AddDriver from './components/deliveryManagement/pages/AddDriver'
// import DashboardPage from './components/deliveryManagement/pages/DashboardPage'
// import Layout from './components/deliveryManagement/pages/Layout'
// import Driverperformance from './components/deliveryManagement/pages/DeliveryPerformanceReport'
// import DeliveryDetails from './components/deliveryManagement/pages/DeliveryDetails'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <BrowserRouter>
//       <div>
//         {/* <nav>
//           <ul>
//             <li><Link to="/deliveries">Deliveries</Link></li>
//             <li><Link to="/drivers">Drivers</Link></li>
//           </ul>
//         </nav> */}
//         <Layout>

//         <Routes>
//           <Route path="/deliveries" element={<Delivery />} />
//           <Route path="/drivers" element={<Driver />} />
//           <Route path="/add-driver" element={<AddDriver />} />
//           <Route path="/driver-performance-report" element={<Driverperformance />} />
//           <Route path="/deliveries/:id" element={<DeliveryDetails />} />
//           <Route path="/" element={<DashboardPage />} />
//         </Routes>
//         </Layout>
//       </div>
//     </BrowserRouter>
//   )
// }

// export default App

//correct
import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
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

// import OrderTrack from './components/deliveryManagement/pages/TrackDeliveryPage'
import DeliveryForm from './components/deliveryManagement/pages/DeliveryForm'; 
import Home from './components/deliveryManagement/pages/Home'
import Driverlayout from './components/deliveryManagement/pages/Driver_layout'



function App() {
  const [count, setCount] = useState(0)


  return (
    <BrowserRouter>
      <div>
        {/* <nav>
          <ul>
            <li><Link to="/deliveries">Deliveries</Link></li>
            <li><Link to="/drivers">Drivers</Link></li>
          </ul>
        </nav> */}

<ToastContainer position="top-right" autoClose={3000} />
    <Layout>

        <Routes>

        <Route path="/driver-layout" element={<Driverlayout />} />

          <Route path="/deliveries" element={<Delivery />} />
          <Route path="/driver-performance-report" element={<Driverperformance />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/drivers" element={<Driver />} />
          <Route path="/driver-performance-report" element={<Driverperformance />} />

      
          <Route path="/add-driver" element={<AddDriver />} />
          <Route path="/tracking-order" element={<TrackingOrder />} />
          <Route path="/delivery/:id" element={<DeliveryDetails />} />
          <Route path="/driver-dashboard" element={< DriverDashboard/>} />
          
          <Route path="/" element={<DashboardPage />} />
          {/* <Route path="/track" element={< OrderTrack/>} /> */}
          <Route path="/add-delivery" element={<DeliveryForm />} />
          <Route path="/home" element={<Home />} />
          
        </Routes>
        </Layout>
      
      </div>
    </BrowserRouter>
  )
}

export default App











































































































































