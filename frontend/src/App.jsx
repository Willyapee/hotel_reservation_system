import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/homePage.jsx';
import Register from './pages/register.jsx';
import Login from './pages/Login.jsx';
import Book from './pages/book.jsx';
import Admin from './pages/admin.jsx';
import Profile from './pages/profile.jsx';
import Cart from './pages/cart.jsx';
import Checkout from './pages/checkout.jsx';
import BookingConfirmed from './pages/bookingConfirmed.jsx';
import BookingHistory from './pages/bookingHistory.jsx'; 
import Invoices from './pages/invoices.jsx'; 
import PrivateRoute from '../src/components/privateRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route 
        path='/profile' 
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } 
      />
      <Route path='/booking' element={<Book />} />
      <Route path='/cart' element={<Cart />} />
      <Route path='/checkout' element={<Checkout />} />
      <Route path='/booking-confirmed' element={<BookingConfirmed />} />
      <Route 
        path='/my-bookings' 
        element={
          <PrivateRoute>
            <BookingHistory />
          </PrivateRoute>
        } 
      />
      <Route 
        path='/invoices' 
        element={
          <PrivateRoute>
            <Invoices />
          </PrivateRoute>
        } 
      />
      <Route
        path='/admin'
        element={
          <PrivateRoute role='admin'>
            <Admin />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;