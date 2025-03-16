import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, {hash} from "bcrypt";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {
    
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "Please provide username/password"})
    }

    try {
        const user= await User.findOne({username});
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({message: "User not found!"})
        }

        let isPasswordCorrect= await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token= token;
            await user.save(); 
            return res.status(httpStatus.OK).json({token: token});
        } else{
            return res.status(httpStatus.UNAUTHORIZED).json({'message': "Invalid username or password!"})
        }
    } catch (error) {
        return res.status(500).json({message: `Something went wrong: ${error}`})
    }
}

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({message: "User already exists!"});
        } 

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(httpStatus.CREATED).json({ message: "User Registered"});

    } catch (error) {
        res.json({ message: `Something went wrong ${error}`});
    }
}

const getHistoryOfUser= async (req, res) => {
    const {token} = req.query;

    try {
        const user= await User.findOne({token: token});
        const meetings= await Meeting.find({userId: user.username});
        res.json(meetings);
    } catch (error) {
        res.json({message: `Something went wrong ${error}`})
    }
}

const addToUserHistory= async (req, res) => {
    const {token, meetingCode}= req.body;

    try {
        const user= await User.findOne({token: token});

        const newMeeting= new Meeting({
            userId: user.username,
            meetingCode: meetingCode
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({message: "Added meeting code to history"})
    } catch (error) {
        res.json({message: `Something went wrong ${error}`})
    }
}

export {login, register, getHistoryOfUser, addToUserHistory}