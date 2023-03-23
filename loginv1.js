const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express()
const PORT = 3000

const users = []

const posts = [
    {
    username:"jose",
    post :"blah blahh"
   },
   {
    username : "chris",
    post : "koo kooo"

}]

app.use(express.json())

// authenticate the posts

app.get('/posts',authenticateToken,(req,res)=>{
    res.json(posts.filter(post=>post.username===req.user.username))

})


// Display  the Registered users

app.get('/register',(req,res)=>{
   res.json(users)

})

// Register the users

app.post('/register',async(req,res)=>{
    const salt = await bcrypt.genSalt()
    const hashedPassword= await bcrypt.hash(req.body.password,salt)
    const user = {username:req.body.username , password:hashedPassword}
    users.push(user)
    res.status(201).send("Registered")
})

// logging in  the users

app.post('/login',async(req,res)=>{
    const user = users.find( user=> user.username===req.body.username)
    if(user==null){
        res.status(401).json({message:"User not found"})
    }

    try{
        if(await bcrypt.compare(req.body.password,user.password)){
            const token= jwt.sign({sub:user.username},'mysecretkey')

            res.json({message:"login successfull",accessToken:token})
            
        }
        else{
            res.send("Wrong password")
        }
    }catch{
        res.sendStatus(500).send()
    }
    
    
})

// authenticating the user

function authenticateToken(req,res,next){
   const authHeader = req.headers["authorisation"]
   const token = authHeader && authHeader.split(' ')[1]
   console.log("test1")
   if (token == null) {
    res.sendStatus(401)
   }
   console.log("test2");
   jwt.verify(token,'mysecretkey',(err,user)=>{
    if (err) return res.sendStatus(403)
    req.user = user
    next()
   })
}



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
