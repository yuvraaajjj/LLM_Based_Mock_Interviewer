const jwt = require("jsonwebtoken")
const User = require("../models/user")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")

dotenv.config()
const jwtsecret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)

async function handleRegister(req, res){
    const {name, lastname, username, password} = req.body
    try{
        const hashedPass = bcrypt.hashSync(password, bcryptSalt)
        const createdUser = await User.create({name, lastname, username, password: hashedPass})

        jwt.sign({userID: createdUser._id, username}, jwtsecret, {}, (err, token) => {
            if(err) throw err
            res.cookie("token", token, {httpOnly: true, sameSite: "lax", secure: true, path:"/"}).status(201).json("User Registered")
        })
    }catch(err){
        console.log("Error", err)
        res.status(500).json({message: "Server Error"})
    }
}

async function handleLogIn(req, res){
    const {username, password} = req.body
    const foundUser = await User.findOne({username})
    if(foundUser){
        const OK = bcrypt.compareSync(password, foundUser.password)
        if(OK){
            jwt.sign({userID: foundUser._id, username}, jwtsecret, {}, (err, token) => {
                if(err) throw err
                res.cookie("token", token, {httpOnly: true, sameSite: "lax", secure: true, path: "/"}).status(201).json({message: "User Logged In"})
            })
        }else{
            res.status(401).json("Wrong PassWord")
        }
    }
}

function handleLoggedIn(req, res){
    const {token} = req.cookies
    if(token){
        jwt.verify(token, jwtsecret, {}, (err, userData) => {
            if(err) throw err
            res.json(userData)

        })
    }else{
        res.status(401).json("No token")
    }
}

module.exports = {
    handleRegister, 
    handleLogIn,
    handleLoggedIn
}