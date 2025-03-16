import React, { useState, useContext } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../styles/homeComponent.module.css';
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {

    let navigate= useNavigate();
    const [meetingCode, setMeetingCode]= useState("");
    const [error, setError] = useState(false);
    const {addToUserHistory}= useContext(AuthContext);

    let handleJoinVideoCall= async () => {
        if (!meetingCode.trim()) {  // Check for empty or spaces
            setError(true);
            return;  // Stop execution
        }
        setError(false);

        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`)
    }

    return (
        <>
            <div className={styles.navBar}>

                <div style={{display: "flex", alignItems: "center" }}>

                    <img src="favicon.png" alt="logo" />
                    <h2>Connectify</h2>
                </div>

                <div style={{display: "flex", alignItems: "center" }}>

                    <IconButton onClick={()=> { navigate("/history")}} >
                        <RestoreIcon/>
                    </IconButton>
                    <p>History</p> &nbsp;

                    <Button onClick={()=>{
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </Button>
                </div>
            </div>

            <div className={styles.meetContainer}>
                <div className={styles.leftPanel}>
                    <div>
                        <h3>Connect with your loved ones</h3> &nbsp;

                        <div style={{display: "flex", gap: "10px" }}>
                            
                            <TextField 
                            onChange={e => setMeetingCode(e.target.value)} 
                            value={meetingCode.trim()} 
                            label="Meeting Code" 
                            variant='outlined' 
                            id='outlined-basic'
                            required
                            error={error}
                            helperText={error ? "Meeting Code is required" : ""}>
                            </TextField>

                            <Button onClick={handleJoinVideoCall} variant='contained'>

                                Join
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

export default withAuth(HomeComponent);
