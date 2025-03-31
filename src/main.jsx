import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App className=" bg-gradient-to-br from-[#0FA280] to-[#054D3B]" />
    <ToastContainer />
  </StrictMode>,
)
