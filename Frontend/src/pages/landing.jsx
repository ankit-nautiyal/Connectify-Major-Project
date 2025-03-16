import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/landingPgComponent.module.css';

export default function LandingPage() {

    const routeTo= useNavigate();
    
    return (
        <div className={styles.landingPageContainer}>
            
                <nav>
                    <div className={styles.navHeader}>
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
                    </div>
                </nav>

                <div className={styles.landingMainContainer}>
                    <div>
                        <h1>Connect with your loved ones</h1>
                        <p>Cover a distance by Connectify!</p>

                        <div role='button'>
                            <Link to="/auth">Get Started</Link>
                        </div>
                    </div>

                    <div>
                        <img src="/mobile2.png" alt="mobile pic" />
                    </div>
                </div>

                <footer >
                    <p>Made with ❤️ by Ankit Nautiyal</p>
                </footer>
        
        </div>
    )
}


