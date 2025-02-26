import express, { urlencoded } from "express";
import { createServer } from "node:http"

import { Server} from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";
import cors from "cors";

const app= express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit: "40kb", exptended: true}));

const start = async () => {
    app.set("mongo_user");
    const connectiondb= await mongoose.connect("mongodb+srv://unitedanvis:w9eVN1U84cfxDESy@zoomprojectcluster.hqzff.mongodb.net/");

    console.log(`MONGO Connected DB Host: ${connectiondb.connection.host}`)
    server.listen(app.get("port"), () =>{
        console.log("LISTENING ON PORT 8000")
    })
}

start();