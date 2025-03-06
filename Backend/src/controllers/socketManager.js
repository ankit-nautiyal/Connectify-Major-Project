import { Server } from "socket.io";

let connections = {}; //connections is an object that tracks which users are in which rooms.
let messages = {};   //messages is an object that stores all messages
let timeOnline = {};  //timeOnline is an object that stores total time a user was online before disconnecting


export const connectToSocket = (server) =>{
    const io= new Server(server, {
        cors: {
            origin: "*",
            methods: ['GET', 'POST'],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        socket.on("join-call", (path) => {

            if(connections[path] === undefined) {
                connections[path] = []        //If the path (room ID) doesn't exist yet, create an empty array for it.

            }
            connections[path].push(socket.id); //Adds the user's socket.id to the connections[path] array

            timeOnline[socket.id] = new Date(); //Saves the current time when the user joins. new Date() creates a date object with the current date and time:


            /* Loops through all users in the room & sends them:
                - a "user-joined" event, passing:
                - socket.id: The ID of the new user.
                - connections[path]: The list of all users in the room.*/

            for(let a=0; a < connections[path].length; a++){                                            
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }


            /*Check if the room (path) has past messages. If yes, loop through all messages in that room &
            send each message only to the new user (socket.id)
            ✅ Effect: When a new user joins, they receive the full chat history so they are not lost.*/

            if (messages[path] !== undefined){
                for (let a=0; a < messages[path].length; ++a){
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                    
                }
            }

        })

        // *****#Summary of What Happens in Abv⬆️ Code Block:*****
        // 1. User joins a call (room) by sending "join-call" with a path.
        // 2. If the room doesn't exist, create it.
        // 3. User is added to the room (connections[path]).
        // 4. User's join time is stored (timeOnline[socket.id]).
        // 5. All other users in the room get notified ("user-joined" event).
        // 6. If past messages exist, send them to the new user.



        socket.on("chat-message", (data, sender) => {                 //Listens for the "chat-message" event, data: The message text, sender: The user who sent the message.
            const [matchingRoom, found] = Object.entries(connections)   //Object.entries(connections): Gets all active rooms.
                .reduce(([room, isFound], [roomKey, roomValue]) => {  //.reduce(): Loops through rooms to find where socket.id exists. If found → Stores the room name in matchingRoom.

                    if(!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }

                    return [room, isFound];
                }, ['', false]); //initialValue of [room, isFound]

                //Alt for abv⬆️ code block from 'const' to 'false' instead of the reducer method:
                // let matchingRoom = '';
                // let found = false;
                // for (const [roomKey, roomValue] of Object.entries(connections)) {
                //     if (roomValue.includes(socket.id)) {
                //         matchingRoom = roomKey;
                //         found = true;
                //         break;  // Exit loop once found
                //     }
                // }


                if(found === true) {
                    if(messages[matchingRoom] === undefined) {
                        messages[matchingRoom] = []        // Initialize if empty
                    }

                    messages[matchingRoom].push({    //If the user is in a room, it saves the message. messages[matchingRoom] is an array of messages for that room.
                        "sender": sender,
                        "data": data,
                        "socket-id-sender": socket.id,
                    })

                    connections[matchingRoom].forEach((element) => {
                        io.to(element).emit("chat-message", data, sender, socket.id); //Sends the message to all users in the room.
                    });
                }
        })


        socket.on("disconnect", () =>{
            var diffTime= Math.abs(timeOnline[socket.id] - new Date());  //The difference gives how long the user was online.

            var key;

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))){   //Object.entries(connections) converts it into an array of [roomID, userList] pairs.
                                                                                            //This for loop goes through each room to check where the user (socket.id) is.
                for (let a=0; a < v.length; ++a){
                    if (v[a] === socket.id) {
                        key=k;

                        //Loop through all users in the same room send them a "user-left" event to let them know who disconnected
                        for( let a=0; a< connections[key].length; ++a){
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }

                        //Find the user's position in connections[key] & remove it from the array
                        var index= connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);

                        //If no users are left in the room, delete it completely.
                        if (connections[key].length ===0) {
                            delete connections[key];
                        }
                    }
                }
            }
        })

        /* *****#Summary of What Happens in Abv⬆️ Code Block:*****
            1. User disconnects ("disconnect" event triggers).
            2. Calculate time spent online (diffTime).
            3. Find the room where the user was.
            4. Notify all other users that the user left.
            5. Remove the user from the room list.
            6. If the room is empty, delete it.*/
    })

    return io;
}