import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import ComplaintDetails from './pages/dashboard/ComplaintDetails';
import NewComplaint from './pages/dashboard/NewComplaint';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AdminSuggestion from './pages/dashboard/AdminSuggestion';
import { AuthProvider } from './context/AuthContext';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />
      <Route path="/customer/dashboard/complaint" element={<NewComplaint />} />
      <Route path="/customer/dashboard/view/:id" element={<ComplaintDetails />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/dashboard/suggestions/:id" element={<AdminSuggestion />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        {/* <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
        /> */}
      </AuthProvider>
    </Router>
  );
}

export default App;
