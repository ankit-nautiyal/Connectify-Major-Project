import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

import express from "express";
import { createServer } from "node:http"
import { Server} from "socket.io";
import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";
import userRoutes from "./routes/users.routes.js";


const app= express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRoutes);


const start = async () => {
    
    try {
        const connectiondb= await mongoose.connect(process.env.MONGODB_ATLAS_URL);
        console.log(`MONGO Connected DB Host: ${connectiondb.connection.host}`)
        server.listen(app.get("port"), () =>{
        console.log(`LISTENING ON PORT ${process.env.PORT}`)
    })
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);  // Exit the process if MongoDB fails to connect
    }
    
}

start();