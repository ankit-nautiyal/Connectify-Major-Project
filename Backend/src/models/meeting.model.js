import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema( 
    {
        userId: {type: String},
        meetingCode: {type: String, required: true},
        date: {type: Date, default: Date.now, required: true},
    }
) 

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };  //used when we need to export many things from this file
                    // for exporting a single thing we use "export defaut" only
                    