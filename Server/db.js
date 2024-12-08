import mongoose from "mongoose";
import dontenv from 'dotenv'

dontenv.config()
const Connection =async()=>{
    try{
        mongoose.connect(process.env.URL)
        console.log("connected to db");
    }
    catch(err){
        console.log("Error: "+err);
    }
}
Connection()