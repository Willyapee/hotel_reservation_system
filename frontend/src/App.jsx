import './App.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

//ROUTER
import { Routes, Route } from 'react-router-dom'

//IMPORT SEMUA PAGE DISINI
import Home from './pages/home.jsx'
import Register from './pages/register.jsx'
import Login from './pages/login.jsx'
import Reservation from './pages/reservation.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}></Route>
      <Route path="/register" element={<Register/>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path='/reservation' element={<Reservation/>}></Route>
    </Routes>
  )
}

export default App
