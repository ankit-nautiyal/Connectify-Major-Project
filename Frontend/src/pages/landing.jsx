import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/landingPgComponent.module.css';
import { Snackbar } from '@mui/material';


export default function LandingPage() {

    const [open, setOpen]= useState(false);
    const routeTo= useNavigate();

    let handleLogout=()=>{
        localStorage.removeItem('token')
        setOpen(true);
    }
    
    return (
        <div className={styles.landingPageContainer}>
            
                <nav className={styles.navBar}>
                    <div className={styles.navHeader} onClick={()=>routeTo("/")}>
                        <img src="favicon.png" alt="logo" />
                        <h2>Connectify</h2>
                    </div>

                    <div className={styles.navList}>
                        
                        <p onClick={()=>{
                            routeTo("/guest")
                        }}>Join as Guest</p>
                        
                        <p onClick={()=>{
                            routeTo("/auth")
                        }}> Register</p>

                        <div role='button' onClick={()=>{
                            routeTo("/auth")
                        }}>
                            <p>Login</p>
                        </div>

                        {localStorage.getItem("token") ? <p onClick={handleLogout} id='logoutBtn'> Logout </p> : <></>}
                    </div>
                </nav>

                <div className={styles.landingMainContainer}>
                    <div>
                        <h1>Connect with your loved ones</h1>
                        <p>Cover a distance by Connectify!</p>

                        <div role='button'>
                            <Link to="/home">Get Started</Link>
                        </div>
                    </div>

                    <div>
                        <img srcSet="/mobile2.png" alt="mobile pic" />
                    </div>
                </div>

                <Snackbar
                    open= {open}
                    autoHideDuration= {4000}
                    message= "Logged Out Successfully"
                    onClose={()=> {setOpen(false)}} 
                />

                <footer >
                    <p>Made with ❤️ by Ankit Nautiyal</p>
                </footer>
        
        </div>
    )
}


