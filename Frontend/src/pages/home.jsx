import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/homeComponent.module.css';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {

    let navigate= useNavigate();
    const [meetingCode, setMeetingCode]= useState("");
    const [error, setError] = useState(false);
    const {addToUserHistory}= useContext(AuthContext);


    // Handle input change: restrict to 4-digit numeric code
    const handleCodeChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,4}$/.test(value)) {   // Only allow 0-4 digits
            setMeetingCode(value);
            setError(false); // Clear error if input is valid so far
        }
    }
    

    let handleJoinVideoCall= async () => {
        if (!meetingCode.trim() || meetingCode.length !== 4 || !/^\d{4}$/.test(meetingCode)) {  
            setError(true);
            return;  // Stop execution
        }
        setError(false);

        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`)
    }

    // Generate random 4-digit code and start instant meeting
    const handleInstantMeeting = async () => {
        const randomCode = Math.floor(1000 + Math.random() * 9000).toString(); // 1000-9999
        await addToUserHistory(randomCode);
        navigate(`/${randomCode}`);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleJoinVideoCall();
        }
    };

    return (
        <>
            <nav className={styles.navBar}>

                <div  onClick={()=>{navigate("/")}}>
                    <img src="favicon.png" alt="logo" />
                    <h2>Connectify</h2>
                </div>

                <div>
                    <IconButton onClick={()=> { navigate("/history")}} >
                        <RestoreIcon/>
                    </IconButton>
                    <p onClick={()=> { navigate("/history")}} >History</p> &nbsp;

                    <Button onClick={()=>{
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </Button>
                </div>
            </nav>

            <div className={styles.meetContainer}>
                <div className={styles.leftPanel}>
                    <div>
                        <h3>Connect with your loved ones</h3> &nbsp;

                        <div>
                            
                            <TextField 
                            onChange={e => setMeetingCode(e.target.value)} 
                            value={meetingCode.trim()} 
                            label="4-Digit Meeting Code" 
                            variant='outlined' 
                            id='outlined-basic'
                            required
                            error={error}
                            helperText={error ? "Enter a 4-digit numeric code" : ""}
                            onKeyDown={handleKeyPress}
                            inputProps={{maxLength:4}}
                            sx={{width: '200px', mb: '15px', mr: '15px'}}
                            >
                            </TextField>


                            <Button onClick={handleJoinVideoCall} variant='contained'>
                                Join
                            </Button>    
                        </div>

                        <p style={{marginLeft: '100px'}}> OR </p>

                        <div>
                            <Button onClick={handleInstantMeeting} variant='contained' color="secondary" sx={{marginTop: '15px'}}>
                                Start an Instant Meeting
                            </Button>
                        </div>
                            

                    </div>
                </div>

                <div className={styles.rightPanel}>
                    <img srcSet='/mobile1.png' alt="mobile1-img" />

                </div>
            </div>

            
            
        </>
    )
}

export default HomeComponent;
