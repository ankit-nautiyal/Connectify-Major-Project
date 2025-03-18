import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from "../styles/authentication.module.css";


// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();

export default function Authentication() {

    const [username, setUsername] = React.useState();
    const [password, setPassword] = React.useState();
    const [name, setName] = React.useState();
    const [error, setError] = React.useState();
    const [message, setMessage] = React.useState();

    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false);
    const navigate= useNavigate();

    const handleClose = () => {
        setOpen(false);
    };

    const {handleRegister, handleLogin} = React.useContext(AuthContext);


    let handleAuth= async () => {
        try {
            if(formState === 0){
                let result = await handleLogin(username, password);
            }
            if (formState === 1) {
                let result= await handleRegister(name, username, password);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                setPassword("");
            }
        } catch (error) {
            let message= (error.response.data.message);
            setError(message);
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleAuth();
        }
    };


    return (
        <ThemeProvider theme={defaultTheme}>
            <img 
                src="auth-pg-img.png" 
                alt="Background" 
                className={styles.authBackground}
            />
            <nav className={styles.navBar}>
                <div  onClick={()=>{navigate("/")}}>
                    <img src="favicon.png" alt="logo" />
                    <h2>Connectify</h2>
                </div>
            </nav>
        <Grid container component="main" sx={{ height: '100vh' }}>
            <CssBaseline />
            <Grid
            item
            xs={false}
            sm={4}
            md={7}


            />

        
            <Grid style={{zIndex: '0'}} item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
                sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
                </Avatar>

                <div>
                    <Button variant= {formState === 0 ? "contained" : "" } onClick={ () => setFormState(0)} >
                        Sign In
                    </Button>
                    <Button variant= {formState === 1 ? "contained" : "" } onClick={ () => setFormState(1)}>
                        Sign Up
                    </Button>
                </div>

                <Box component="form" noValidate  sx={{ mt: 1 }}>
                    {formState === 1 ?  <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="Full Name"
                        label="Full Name"
                        name="Full Name"
                        value={name}
                        autoFocus
                        onChange={(e)=>setName(e.target.value)}
                    /> : <></> }

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        value={username}
                        autoFocus
                        onChange={(e)=>setUsername(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />

                    <p style={{color: "red"}} > {error}</p>
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={handleAuth}
                    >
                        {formState === 0 ? "Login" : "Register"}
                    </Button>
                </Box> 
            </Box>
            </Grid>
        </Grid>

        <Snackbar
            open= {open}
            autoHideDuration= {4000}
            message= {message} 
            onClose={handleClose} 
        />
            

        </ThemeProvider>
    );
}