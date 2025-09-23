import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/home.css';

export default function Home() {
    return (
        <div>
            <div>
                <Link to='/login'>Login</Link>
            </div>
            <div>
                <Link to={'/register'}>Register</Link>
            </div>
            <div>
                <Link to={'/reservation'}>Reservation</Link>
            </div>
        </div>
    );
}