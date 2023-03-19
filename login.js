const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
const PORT = 3000

const users = []

app.use(express.json())

// Display  the Registered users

app.get('/register',(req,res)=>{
   res.json(users)

})

// Register the users

app.post('/register',(req,res)=>{
    const user = {username:req.body.username , password:req.body.password}
    users.push(user)
    res.status(201).send("Registered")
})

// logging in  the users

app.post('/login',(req,res)=>{
    const {username , password} = req.body
    const user = users.find( u=> u.username===username &&  u.password===password)
    if(!user){
        res.status(401).json({message:"Invalid username or password"})
    }

    // token generation

    const token= jwt.sign({sub: user.username},'mysecretkey')

    res.json({message:"login successfull",token})
})

//logging out users

app.post('/logout',(req,res)=>{
    res.json({message:"Logged out successfully"})
})


app.listen(PORT,(error)=>{
    if(!error){
        console.log(`Server successfully running on port ${PORT}`)
    }else{
        console.log("connection failed");
    }
})


