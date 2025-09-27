//FILE PERCOBAANNYA WILLY GA NGARUH SAMA PROJEK KELEN
import React, { useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    axios.defaults.withCredentials = true;

    const validatePassword = () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return false;
        }
        return true;
    };
    
    /*SAMA AJA spt
    function handleSubmit(e) {}
    e adalah argument event yg didapat dari onSubmit.
    */
    const handleSubmit = (e) => {
        if (!validatePassword()) return;
        e.preventDefault(); //prevent reload page abis submit
        console.log(name, email, password);

        axios.post('http://localhost:3000/auth/register', {
            name,
            email,
            password
        }).then((res) => {
            if (res.status === 201) alert("Registration successful");
        }).catch((error) => {
            console.log(error);
        })
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Name"
                    value={name}
                    //e = event dari React (isi, target, dll).
                    //=> = arrow function, cara singkat nulis function.
                    onChange={(e) => setName(e.target.value)}
                />
                <br></br>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    />
                <br></br>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    />
                <br></br>
                <label>Confirm Password</label>
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                <br></br>
                <button type="submit">Submit</button>
            </form>
            <label> already have an account? <Link to='/login'>Login here</Link></label>

        </>
    );
};
export default Register;