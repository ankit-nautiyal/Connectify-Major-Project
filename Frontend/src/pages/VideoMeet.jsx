import CallEndIcon from '@mui/icons-material/CallEnd';
import CommentIcon from '@mui/icons-material/Comment';
import CommentsDisabledIcon from '@mui/icons-material/CommentsDisabled';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import RestoreIcon from '@mui/icons-material/Restore';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import SendIcon from '@mui/icons-material/Send';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import { Badge, Button, IconButton, TextField } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import server from '../environment';
import styles from "../styles/videoComponent.module.css";

const formatTimestamp = (date) => {
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
};

const server_url= `${server}`;

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
    const chatContainerRef = useRef(null);

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(true);

    let [audio, setAudio] = useState(true);

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

    const initializeStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: videoAvailable, 
                audio: audioAvailable 
            });
            window.localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (e) {
            console.log("Initial stream error:", e);
            window.localStream = new MediaStream([blackScreen(), silentMic()]);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = window.localStream;
            }
        }
    };

    useEffect(() => {
        const initializeStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: videoAvailable, 
                    audio: audioAvailable 
                });
                window.localStream = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (e) {
                console.log("Initial stream error:", e);
                window.localStream = new MediaStream([blackScreen(), silentMic()]);
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = window.localStream;
                }
            }
        };
    
        getPermissions().then(() => initializeStream());
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
        return stream.getVideoTracks()[0]; // Return enabled track for black screen
    }

    
    // let getUserMediaSuccess =(stream)=>{
    //     try {
    //         if (window.localStream){
    //         window.localStream.getTracks().forEach(track => track.stop());
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     } 

    //     window.localStream= stream;
    //     if (localVideoRef.current) {
    //         localVideoRef.current.srcObject = stream;
    //     }

    //     for (let id in connections){
    //         if (id === socketIdRef.current) continue;

    //         connections[id].addStream(window.localStream);

    //         connections[id].createOffer().then((description)=>{
    //             connections[id].setLocalDescription(description)
    //             .then(() =>{
    //                 socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
    //             }) 
    //             .catch(e=> console.log(e))
    //         })
    //     } 

    //     stream.getTracks().forEach(track => track.onended = () =>{
    //         setVideo(false);
    //         setAudio(false);
    //         updateStreamWithBlackSilence();
    //     })
    // }

    const getUserMediaSuccess = (stream) => {
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
        }
        window.localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }
        updatePeersWithNewStream();
    };


    // let updateStreamWithBlackSilence = () => {
    //     try {
    //         if (window.localStream) {
    //             window.localStream.getTracks().forEach(track => track.stop());
    //         }
    //     } catch (e) {
    //         console.log(e);
    //     }
    //     const blackSilence = new MediaStream([blackScreen(), silentMic()]);
    //     window.localStream = blackSilence;
    //     if (localVideoRef.current) {
    //         localVideoRef.current.srcObject = blackSilence;
    //     }

    //     for (let id in connections) {
    //         if (id === socketIdRef.current) continue;
    //         connections[id].addStream(window.localStream);
    //         connections[id].createOffer().then((description) => {
    //             connections[id].setLocalDescription(description)
    //                 .then(() => {
    //                     socketRef.current.emit('signal', id, JSON.stringify({ "sdp": connections[id].localDescription }));
    //                 })
    //                 .catch(e => console.log(e));
    //         });
    //     }
    // };


    // let getUserMedia= () =>{
    //     if ((video && videoAvailable ) || (audio && audioAvailable)) {
    //         navigator.mediaDevices.getUserMedia({video: video, audio: audio})
    //         .then(getUserMediaSuccess) 
    //         .then((stream)=>{})
    //         .catch((e) => console.log(e));
    //     } else {
    //         try {
    //             let tracks= localVideoRef.current.srcObject.getTracks();
    //             tracks.forEach(track => track.stop());
    //         } catch (error) {
    //             console.log(e);
    //         }
    //     } 
    // }

    const getUserMedia = async () => {
        if (video && videoAvailable) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: audio });
                getUserMediaSuccess(stream);
            } catch (e) {
                console.log("getUserMedia error:", e);
                const blackStream = new MediaStream([blackScreen(), window.localStream?.getAudioTracks()[0] || silentMic()]);
                getUserMediaSuccess(blackStream);
            }
        } else {
            const blackStream = new MediaStream([blackScreen(), window.localStream?.getAudioTracks()[0] || silentMic()]);
            getUserMediaSuccess(blackStream);
        }
    };

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
        const timestamp = formatTimestamp(new Date()); // Get current time
        setMessages((prevMessages)=>[
            ...prevMessages,
            {sender: sender, data: data, socketId: socketIdSender, timestamp}
        ])

        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevMessages)=> prevMessages + 1)
        }   

        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }

    const handleChatToggle = () => {
        setModal((prevShowModal) => !prevShowModal);
    };

    useEffect(() => {
        if (showModal && chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [showModal, messages]);

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () => {

            socketRef.current.emit("join-call", window.location.href, username);

            socketIdRef.current= socketRef.current.id;

            socketRef.current.on("chat-message", addMessage );

            socketRef.current.on("user-left", (id) => {
                setVideos((videos)=> videos.filter((video)=>video.socketId !== id))
                // Check if this user is the last one leaving
                if (videos.length === 1 && videos[0].socketId === id) {
                    setMessages([]); // Clear messages if last user leaves
                    setNewMessages(0);
                }
            })

            socketRef.current.on("user-joined", (id, clients, users)=> { // `usernames` is an object mapping socket IDs to usernames
                clients.forEach((socketListId)=>{
                    if (!videoRef.current.find(video => video.socketId === socketListId)) {
                        connections[socketListId]= new RTCPeerConnection(peerConfigConnections);

                        connections[socketListId].onicecandidate= (event) =>{
                            if (event.candidate !== null) {
                                socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate}));
                            }
                        }

                        connections[socketListId].onaddstream= (event)=>{

                            let videoExists=  videoRef.current.find(video => video.socketId === socketListId);
                            const userName = users[socketListId] || "Unknown"; // Fallback if username not found
                            if (videoExists) {
                                setVideos(videos =>{
                                    const updatedVideos = videos.map(video =>
                                        video.socketId === socketListId ? {...video, stream: event.stream, username: userName} : video
                                    );

                                    videoRef.current= updatedVideos;
                                    return updatedVideos; 
                                })
                            } else {
                                
                                let newVideo= {
                                    socketId: socketListId,
                                    stream: event.stream,
                                    username: userName,
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
        connectToSocketServer();
    }



    // let handleVideo = () => {
    //     if (video) {
    //         // Turning video off
    //         if (window.localStream) {
    //             window.localStream.getVideoTracks().forEach(track => track.stop());
    //             const newStream = new MediaStream([blackScreen(), window.localStream.getAudioTracks()[0] || silentMic()]);
    //             window.localStream = newStream;
    //             if (localVideoRef.current) {
    //                 localVideoRef.current.srcObject = newStream;
    //             }
    //             updatePeersWithNewStream();
    //         }
    //     } else {
    //         // Turning video back on
    //         getUserMedia();
    //     }
    //     setVideo(!video);
    // };

    let handleVideo = () => {
        if (video) {
            // Turning video off
            if (window.localStream) {
                window.localStream.getVideoTracks().forEach(track => track.stop());
                const newStream = new MediaStream([blackScreen(), window.localStream.getAudioTracks()[0] || silentMic()]);
                window.localStream = newStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = newStream;
                }
                updatePeersWithNewStream();
            }
        } else {
            // Turning video back on
            getUserMedia();
        }
        setVideo(!video);
    };

    let updatePeersWithNewStream = () => {
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    })
                    .catch(e => console.log(e));
            });
        }
    };

    let handleAudio = () => {
        if (window.localStream) {
            window.localStream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
        }
        setAudio(!audio);
    };
    
    // let getDisplayMediaSuccess = (stream) => {
    //     try {
    //         window.localStream.getTracks().forEach(track => track.stop());
    //     } catch (e) { console.log(e) }

    //     window.localStream = stream;
    //     localVideoRef.current.srcObject = stream;

    //     for (let id in connections) {
    //         if (id === socketIdRef.current) continue

    //         connections[id].addStream(window.localStream)

    //         connections[id].createOffer().then((description) => {
    //             connections[id].setLocalDescription(description)
    //                 .then(() => {
    //                     socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
    //                 })
    //                 .catch(e => console.log(e)) 
    //         })
    //     }

    //     stream.getTracks().forEach(track => track.onended = () => {
    //         setScreen(false)

    //         try {
    //             let tracks = localVideoRef.current.srcObject.getTracks()
    //             tracks.forEach(track => track.stop())
    //         } catch (e) { console.log(e) }

    //         let blackSilence = (...args) => new MediaStream([black(...args), silence()])
    //         window.localStream = blackSilence()
    //         localVideoRef.current.srcObject = window.localStream

    //         getUserMedia()

    //     })
    // };

    const getDisplayMediaSuccess = (stream) => {
        if (window.localStream) {
            window.localStream.getTracks().forEach(track => track.stop());
        }
        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        updatePeersWithNewStream();

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            getUserMedia();
        });
    };
    

    let getDisplayMedia= () =>{
        if (screen) {
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                    .then(getDisplayMediaSuccess)
                    .catch((e)=> console.log("Screen share error:", e));
            }
        }
    };

    useEffect(()=>{
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])
    
    let handleScreen = () =>{
        setScreen(!screen);
    }

    let sendMessage = () =>{
        const trimmedMessage = message.trim();
        if (trimmedMessage.length > 0) {
            socketRef.current.emit("chat-message", trimmedMessage, username);
            setMessage("");
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    let handleEndCall = () =>{
        if (socketRef.current) {
            socketRef.current.disconnect(); // Disconnect from socket
        }
        setMessages([]); // Clear messages on end call
        setNewMessages(0);
        setVideos([]); // Clear videos
        setModal(false); // Close chat modal
        setAskForUsername(true); // Return to lobby
        try {
            let tracks= localVideoRef.current.srcObject.getTracks(); // Stop media tracks
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
                        onKeyDown={(e)=> {if (e.key === "Enter") {connect()}} }
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
                            <h1>In-call Messages</h1>
                            <hr /> &nbsp;

                            <div className={styles.chattingDisplay}>
                                { messages.length > 0 ? messages.map((item, index)=> {
                                    return(
                                        <div key={index} className={`${styles.messageWrapper} ${item.socketId === socketIdRef.current ? styles.selfMessage : styles.otherMessage}`} >

                                            <div className={styles.messageHeader}>
                                                {item.socketId === socketIdRef.current ? (
                                                    <>
                                                        <p className={styles.timestamp}>{item.timestamp}</p>
                                                        <p className={styles.senderName}>You</p>
                                                    </> ) : (
                                                    
                                                    <>
                                                        <p className={styles.senderName}>{item.sender}</p>
                                                        <p className={styles.timestamp}>{item.timestamp}</p>
                                                    </>
                                                )}
                                            </div>
                                            <p className={styles.messageContent}> {item.data}</p>
                                        </div>
                                    )
                                }) : <p>No messages yet</p>}
                            </div>
                            <div className={styles.chattingArea}>
                                <TextField value={message} onKeyDown={handleKeyPress} onChange={(e)=> setMessage(e.target.value)} id="outlined-basic" label="Enter your message" variant="outlined" /> &nbsp;
                                <Button  variant='contained' onClick={sendMessage}>Send &nbsp; <SendIcon/></Button>
                                        
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
                                <IconButton onClick={handleChatToggle} style={{color:'white'}}>
                                    { showModal === true ? <CommentIcon/> : <CommentsDisabledIcon/>}
                                </IconButton>
                            </Badge> 
                    </div>


                    <div className={styles.selfVideoWrapper}>
                        <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
                        <p className={styles.videoUsername}>{username}</p>
                    </div>
            
                    
                    <div className={styles.conferenceView}>
                        {videos.map((video) => (
                                <div  key={video.socketId} className={styles.videoWrapper}>
                
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
                                    <p className={styles.videoUsername}>{video.username}</p>
                                </div>
                            ))}
                    </div >
                        
                </div>
                
            }  
        </div>
    )
}