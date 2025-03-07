import React from 'react';
import '../App.css';
import { BrowserRouter, Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className='landingPageContainer'>
            {/* <BrowserRouter> */}
                <nav>
                    <div className='navHeader'>
                        <h2>Apna Video Call</h2>
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
                        <p>Cover a distance by Apna Video Call</p>

                        <div role='button'>
                            <Link to="/home" >Get Started</Link>
                        </div>
                    </div>

                    <div>
                        <img src="/mobile2.png" alt="mobile pic" />
                    </div>
                </div>
            {/* </BrowserRouter> */}
        
        </div>
    )
}
