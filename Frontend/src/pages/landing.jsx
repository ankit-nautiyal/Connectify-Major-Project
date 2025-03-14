import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className='landingPageContainer'>
            
                <nav>
                    <div className='navHeader'>
                        <img src="favicon.png" alt="logo" />
                        <h2>Connectify</h2>
                    </div>

                    <div className='navList'>
                        <p>Join as Guest</p>
                        
                        <p>Register</p>

                        <div role='button'>
                            <p>Login</p>
                        </div>
                    </div>
                </nav>

                <div className="landingMainContainer">
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

                <footer>
                    <p>Made with ❤️ by Ankit Nautiyal</p>
                </footer>
        
        </div>
    )
}
