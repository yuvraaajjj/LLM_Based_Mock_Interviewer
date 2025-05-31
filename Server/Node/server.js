const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const {handleRegister, handleLogIn, handleLoggedIn} = require("./Controllers/login&register")

dotenv.config()

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Database Connected")
})

const app = express();

const PORT = 8000;


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: true,
}))

app.get("/", (req, res) => {
    res.json("OK");
}) 

app.post("/register", handleRegister)
app.post("/login", handleLogIn)
app.get("/loggedin", handleLoggedIn)

app.listen(PORT, () => {
    console.log(`Server started at ${PORT}`);
})