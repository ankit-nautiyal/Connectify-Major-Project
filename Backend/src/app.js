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

const app= express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit: "40kb", exptended: true}));

const start = async () => {
    app.set("mongo_user");
    const connectiondb= await mongoose.connect(process.env.ATLASDB_URL);

    console.log(`MONGO Connected DB Host: ${connectiondb.connection.host}`)
    server.listen(app.get("port"), () =>{
        console.log(`LISTENING ON PORT ${process.env.PORT}`)
    })
}

start();