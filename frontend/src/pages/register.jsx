import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() { 
    const [values, setValues] = useState({
        username: '',
        email: '',
        password: ''
    })
    const handleChanges = (e) => {
        setValues({...values, [e.target.name]: e.target.value})
    }   
    const handleSubmit = async(e) => { 
        e.preventDefault(); //prevent default submition
        try {
            const response = await axios.post("http://localhost:8080/auth/register", values)
            console.log(response);
        } catch (err) { 
            console.log(err);
        }
    }

    return (
        <>
            <div>
                <form action="">
                    <div>
                        <lable>Username</lable>
                        <input type="text" placeholder='Enter Username'
                            //name harus sama dengan const state variable
                            name="username" onChanges={handleChanges} />
                    </div>
                    <div>
                        <lable>email</lable>
                        <input type="email" placeholder='Enter Email'
                        name="email" onChanges={handleChanges} />
                    </div>
                    <div>
                        <lable>Username</lable>
                        <input type="password" placeholder='Enter Password' 
                        name="password" onChanges={handleChanges} />
                    </div>
                    <button type='submit'>Register</button>
                </form>
            </div>
            <div>
                <p>Already have account</p>
                <Link to='/login'>Login</Link>
            </div>
        </>
    );
}