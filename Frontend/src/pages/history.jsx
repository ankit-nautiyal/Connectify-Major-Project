import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton, Snackbar } from '@mui/material';



export default function History() {

    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])
    const [open, setOpen] = useState(false); // For Snackbar

    const handleClose = () => {
        setOpen(false);
    };


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
    
                // Sort meetings by date in descending order (latest first)
                history.sort((a, b) => new Date(b.date) - new Date(a.date));
    
                setMeetings(history);
            } catch {
                setOpen(true); // Show Snackbar on error/no meetings
            }
        };
    
        fetchHistory();
    }, []);
    

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };
    
    let formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    };
    
    return (
        <div>

            <IconButton onClick={() => { routeTo("/home")} }>
                <HomeIcon />
            </IconButton >

            
            {meetings.length !== 0 ? (
                meetings.map((e, i) => (
                
                        <Card key={i} variant="outlined">


                            <CardContent>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                                    Meeting Code: {e.meetingCode}
                                </Typography>

                                <Typography sx={{ mb: 1 }} color="text.secondary">
                                    Date: {formatDate(e.date)}
                                </Typography>

                                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                    Time: {formatTime(e.date)}
                                </Typography>

                            </CardContent>

                        </Card>    
                ))
            ) : ( <Typography>No meetings yet</Typography> 

            )}

            <Snackbar
                open={open}
                autoHideDuration={4000}
                message="No meetings yet or failed to fetch history"
                onClose={handleClose}
            />

        </div>
    )
}