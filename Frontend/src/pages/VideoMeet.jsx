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
import CommentIcon from '@mui/icons-material/Comment';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import SendIcon from '@mui/icons-material/Send';
import RestoreIcon from '@mui/icons-material/Restore';
import { useNavigate } from "react-router-dom";
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

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const [error, setError] = useState(false);

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]); // Array of remote video streams

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


    let silentMic= () =>{
        let ctx= new AudioContext();
        let oscillator = ctx.createOscillator(); // to create a constant silent tone when mic is off

        let dst= oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
    }

    let blackScreen= ({width= 640, height = 480}= {}) =>{
        let canvas= Object.assign(document.createElement("canvas"), {width, height });
        
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream= canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled: false});
    }

    
    let getUserMediaSuccess =(stream)=>{
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.log(error);
        } 

        window.localStream= stream;
        localVideoRef.current.srcObject= stream;

        for (let id in connections){
            if (id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream);

            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description)
                .then(() =>{
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                }) 
                .catch(e=> console.log(e))
            })
        } 

        stream.getTracks().forEach(track => track.onended = () =>{
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }

            let blackSilence= (...args) => new MediaStream([blackScreen(...args), silentMic()]); 
            window.localStream= blackSilence();
            localVideoRef.current.srcObject= window.localStream;

            for(let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description)=>{
                    connections[id].setLocalDescription(description)
                        .then(()=>{
                            socketIdRef.current.emit('signal', id, JSON.stringify({"sdp": connections[id].localDescription}))
                        })
                        .catch(e=> console.log(e)); 
                })
                
            }
        })
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
            }
        } 
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video])
    
    
    let gotMessageFromServer= (fromId, message) =>{
        var signal= JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                    if (signal.sdp.type === "offer") {
                        
                        connections[fromId].createAnswer().then((description)=>{
                            connections[fromId].setLocalDescription(description).then(()=>{
                                socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}));
                            }).catch(e=>console.log(e))
                        }).catch(e=>console.log(e))
                    }
                }).catch(e=>console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e=>console.log(e));
            }
        }
    }


    let addMessage= (data, sender, socketIdSender) =>{

        setMessages((prevMessages)=>[
            ...prevMessages,
            {sender: sender, data: data}
        ])

        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevMessages)=> prevMessages + 1)
        }   
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () => {

            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current= socketRef.current.id;

            socketRef.current.on("chat-message", addMessage );

            socketRef.current.on("user-left", (id) => {
                setVideos((videos)=> videos.filter((video)=>video.socketId !== id))
            })

            socketRef.current.on("user-joined", (id, clients)=> {
                clients.forEach((socketListId)=>{

                    connections[socketListId]= new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate= (event) =>{
                        if (event.candidate !== null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate}));
                        }
                    }

                    connections[socketListId].onaddstream= (event)=>{

                        let videoExists=  videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos =>{
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? {...video, stream: event.stream} : video
                                );

                                videoRef.current= updatedVideos;
                                return updatedVideos; 
                            })
                        } else {
                            
                            let newVideo= {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true
                            }

                            setVideos(videos=> {
                                const updatedVideos= [...videos, newVideo];
                                videoRef.current= updatedVideos;
                                return updatedVideos; 
                            })
                        }
                    };

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence= (...args) => new MediaStream([blackScreen(...args), silentMic()]); 
                        window.localStream= blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });   

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream);
                        } catch (e) {
                            console.log(e);
                        }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        }) 
    }

    let getMedia= ()=>{
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }



    let handleVideo= ()=>{
        setVideo(!video);
    }

    let handleAudio= ()=>{
        setAudio(!audio);
    } 
    
    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e)) 
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            getUserMedia()

        })
    }
    

    let getDisplayMedia= () =>{
        if (screen) {
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                    .then(getDisplayMediaSuccess)
                    .then((stream)=> { })
                    .catch((e)=> console.log(e));
            }
        }
    }

    useEffect(()=>{
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])
    
    let handleScreen = () =>{
        setScreen(!screen);
    }

    let sendMessage = () =>{
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }

    let handleEndCall = () =>{
        try {
            let tracks= localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (error) {
            console.log(error)
        }

        routeTo("/home");
    }

    let routeTo= useNavigate();

    let connect = () => {
        if (!username.trim()) {  // Check for empty or spaces
            setError(true);
            return;  // Stop execution
        }
        
        setError(false);
        setAskForUsername(false);
        getMedia();
    };
    

    return (
        <div>
            {askForUsername === true ? 
                <div>

                    <nav className={styles.navBar}>

                        <div onClick={()=>{routeTo("/")}}>
                            <img src="favicon.png" alt="logo" />
                            <h2>Connectify</h2>
                        </div>

                        <div>
                            {(localStorage.getItem("token")) ? (
                                <>
                                    <IconButton onClick={()=> { routeTo("/history")}} >
                                    <RestoreIcon/>
                                    </IconButton>
                                    <p onClick={()=> { routeTo("/history")}}>History</p> &nbsp;

                                    <Button onClick={()=>{
                                        localStorage.removeItem("token")
                                        routeTo("/auth")
                                    }}>
                                        Logout
                                    </Button> 
                                </>
                            ): <></>}
                        </div>
                    </nav>

                    <h3 style={{margin:"50px 20px 0px 20px"}}>Enter into Lobby</h3>
                    
                    <TextField 
                        required 
                        style={{margin:"10px 20px 10px 20px", borderRadius: "10px"}}
                        id="outlined-basic" 
                        label="Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        variant="outlined"
                        error={error}
                        helperText={error ? "Username is required" : ""} 
                    /> 
                    <Button style={{margin:"18px"}} variant="contained" onClick={connect}>Connect </Button>

                    <div className={styles.lobbyVcImg}>
                        <img srcSet="/lobby-vc-img.png" alt="lobby img" />
                    </div>
                    
                    <div>
                        <video className={styles.lobbyPageVideo} ref={localVideoRef} autoPlay muted></video>
                    </div>

                </div> 
                
                : <div className={styles.meetVideoContainer}>
                    
                    {showModal ? <div className={styles.chatRoom}>
                        

                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>
                            <hr /> &nbsp;

                            <div className={styles.chattingDisplay}>
                                { messages.length > 0 ? messages.map((item, index)=> {
                                    return(
                                        <div key={index} style={{marginBottom: "20px"}}>
                                            <p style={{fontWeight:"bold"}}>{item.sender} </p>
                                            <p>{item.data}</p>
                                        </div>
                                    )
                                }) : <p>No messages yet</p>}
                            </div>
                            <div className={styles.chattingArea}>
                                <TextField value={message} onChange={(e)=> setMessage(e.target.value)} id="outlined-basic" label="Enter your chat" variant="outlined" /> &nbsp;
                                <Button variant='contained' onClick={sendMessage}>Send &nbsp; <SendIcon/></Button>
                            </div>
                        </div>
                    </div> : <></> } 

                    <div className={styles.buttonContainers}>
                            <IconButton onClick={handleVideo} style={{color: 'white'}}>
                                {(video === true) ? <VideocamIcon/> : <VideocamOffIcon/>}
                            </IconButton>

                            <IconButton onClick={handleEndCall} style={{color: 'red '}}>
                                <CallEndIcon  />
                            </IconButton>

                            <IconButton onClick={handleAudio } style={{color: 'white'}}>
                                {audio === true ? <MicIcon/>: <MicOffIcon/>}
                            </IconButton>

                            {screenAvailable === true ?
                                <IconButton onClick={handleScreen} style={{color:'white'}}>
                                    {screen === true ? <ScreenShareIcon/> : <StopScreenShareIcon/> }
                                </IconButton> : <></>
                            }


                            <Badge badgeContent={newMessages} max={999} color='secondary'>
                                <IconButton onClick={() => setModal(!showModal)} style={{color:'white'}}>
                                    { showModal === true ? <CommentIcon/> : <CommentsDisabledIcon/>}
                                </IconButton>
                            </Badge> 
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
                    
                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                                <div  key={video.socketId}>
                
                                    <video 
                                        data-socket= {video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject= video.stream;
                                            }
                                        }}
                                        autoPlay
                                    >

                                    </video>
                                </div>
                            ))}
                    </div >
                        
                </div>
                
            }  
        </div>
    )
}