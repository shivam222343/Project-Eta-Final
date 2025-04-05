import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

function connect() {
    mongoose.connect("mongodb+srv://projecteta2227:eta2227@eta.dpy6l.mongodb.net/")
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch(err => {
            console.log(err);
        })
}

export default connect;