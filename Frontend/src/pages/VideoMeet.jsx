import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
// import server from '../environment';

const server_url= "http://localhost:8000";

var connections= {};

const peerConfigConnections= {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState();

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);

    //TODO
    // if (isChrome) {
        
    // }

    const getPermissions = async () => {
        try {
            const videoPermission= await navigator.mediaDevices.getUserMedia({video:true});

            if (videoAvailable) {
                setVideoAvailable(true);
            } else {
                setVideoAvailable(false);
            }

            const audioPermission= await navigator.mediaDevices.getUserMedia({audio:true});

            if (audioAvailable) {
                setAudioAvailable(true);
            } else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});
            
                if (userMediaStream) {
                    window.localStream= userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject= userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error); 
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    let getUserMediaSuccess =(stream)=>{

    }

    let getUserMedia= () =>{
        if ((video && videoAvailable ) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({video: video, audio: audio})
            .then(getUserMediaSuccess) //getUserMediaSuccess :TODO
            .then((stream)=>{})
            .catch((e) => console.log(e));
        } else {
            try {
                let tracks= localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(e);
;            }
        }
    }
    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video])
    

    let getMedia= ()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let connect= () =>{
        setAskForUsername(false);
        getMedia();
    }
    

    return (
        <div>
            {askForUsername === true ? 
                <div>
                    <h2>Enter into Lobby</h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)  } variant="outlined" /> 
                    <Button variant="contained" onClick={connect}>Connect</Button>

                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>

                </div> 
                
                : <> </>
                
            }  

            
        </div>
    )
}
