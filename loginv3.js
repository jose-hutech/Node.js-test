const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const app = express()
const PORT = 3000

const users = []

const blacklistedTokens = []

const posts = [
    {
    
    post1 :"blah blahh"
   },
   {
   
    post2 : "koo kooo"

}]

app.use(express.json())

// display  the posts

app.get('/posts',authenticateToken,(req,res)=>{

res.json(posts)
})


// Display  the Registered users

app.get('/register',(req,res)=>{
   res.json(users)

})


// Register the users
  
  app.post('/register',async(req,res)=>{
 
  
  const {username,password} = req.body

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/
  if (!passwordRegex.test(password)){
    return res.status(400).send("password must be strong with atleast one special character,one uppercase letter,a lower case letter and a numeric digit")
  }
 const salt = await bcrypt.genSalt()
 const hashedPassword = await bcrypt.hash(password,salt)

 const user = {username,password:hashedPassword}
 users.push(user)
res.status(201).send('Registered')
  
})


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
    
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) {
   res.sendStatus(401)
  } 

  if (blacklistedTokens.includes(token)){
   res.sendStatus(401)
  }

  jwt.verify(token,'mysecretkey',(err,user)=>{
   if (err) return res.sendStatus(403)
   req.user = user
   next()
  })
}



//logging out users

app.post('/logout',(req,res)=>{
  const token = req.headers.authorization.split('')[1]
  blacklistedTokens.push(token)
  res.json({message:"Logged out successfully"})
})



app.listen(PORT,(error)=>{
    if(!error){
        console.log(`Server successfully running on port ${PORT}`)
    }else{
        console.log("connection failed");
    }
})




