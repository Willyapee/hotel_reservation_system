//FILE PERCOBAANNYA WILLY GA NGARUH SAMA PROJEK KELEN
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    /*SAMA AJA spt
    function handleSubmit(e) {}
    e adalah argument event yg didapat dari onSubmit.
    */

    const handleLogin = async (e) => { 
        e.preventDefault(); //prevent reload page abis submit
        console.log(email, password);

        axios.post("http://localhost:3000/auth/login", {
                email,
                password,
        }).then((res) => {
            if (res.status === 200) {
                alert("Login successful");
                navigate('/'); // Redirect to home page after successful login
            }
        }).catch(error => {
            console.log(error);
            alert("Login failed. Please check your credentials and try again.");
        })
    };

    return (
        <>
            <form onSubmit={handleLogin}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <br />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <br />
                <button type="submit">Submit</button>
                <br />
                <label>Don't have an account? <Link to='/register'>Register here</Link></label>
            </form>
        </>
    );
};
export default Login;