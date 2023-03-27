const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {MongoClient} = require('mongodb')
const PORT = 3000
const app =express()
const uri= 'mongodb+srv://chris:chris-123@cluster0.3nvcklr.mongodb.net/?retryWrites=true&w=majority'

// cluster firstproject

const client = new MongoClient(uri,{ useNewUrlParser:true ,useUnifiedTopology:true})

let users,blacklistedTokens,posts
console.log("jdjfjfj");
client.connect(err=>{
    console.log("kdks");
    if(err){
       console.log("Failed to connect to MongoDB database") 
       process.exit(1)
    }

    console.log("Connected to MongoDB database")
    const db = client.db("LoginDatabase")
    users = db.collection("users")
    posts = db.collection("posts")
    blacklistedTokens = db.collection("expireTokens")
})

app.use(express.json())

//Display the posts

app.get('/posts',authenticateToken,(req,res)=>{
  posts.find({}).toArray((err,data)=>{
    if (err){
        res.sendStatus(500)
    }
    else{
        res.json(data)
    }
  })
})

// Display the registered users

app.get('/register',(req,res)=>{
    users.find({}).toArray((err,data)=>{
        if(err){
            res.sendStatus(500)
        }
        else{
            res.json(data)
        }
    })
})

// Display the blacklisted tokens

app.get('/expiretokens',(req,res)=>{
    blacklistedtokens.find({}).toArray((err,data)=>{
        if (err){
            res.sendStatus(500)
        }
        else{
            res.json(data)
        }
    })
})


// Register the users


app.post('/register',async(req,res)=>{
    const {username,password} = req.body
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/
    if(!passwordRegex.test(password)){
        res.status(400).send("Password must be strong with a lowercase& uppercase letter,a numeric digit and a special character")
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password,salt)

    const user = {username,password:hashedPassword}
    users.insertOne(user,(err,data)=>{
     if(err){
        res.sendStatus(500)
     }else{
        res.status(201).send('Registered')
     }   
    })
})


// logging in the users

app.post('/login', async (req,res)=>{
    const user = await users.findOne({username:req.body.username})
    if (user == null){
        res.status(401).json({message:"User not found"})
    }

    try{
        if(await bcrypt.compare(req.body.password,user.password)){
            const token = jwt.sign({sub:user.username},"mysecretkey")
            res.json({message:"login successfull" ,accessToken: token})
        }else{
            res.send("wrong password")
        }
    }
    catch{
        res.sendStatus(500)
    }
     
})

// authenticating the user

function authenticateToken (req,res,next){
    const authHeader = req.headers.authorization
    const token = authHeader.split(' ')[1]

    if (token==null){
       return res.sendStatus(400)
    }

    blacklistedTokens.findOne({token:token},(err,result)=>{
        if(err){
            res.sendStatus(500)
        }
        else if(result){
           res.sendStatus(401)
        } else{
            jwt.verify(token,"mysecretkey",(err,user)=>{
                if (err){
                    res.sendStatus(403)
                }else{
                    req.user=user
                    next()
                }

            })

        }
    })
}


//logging out users and blacklisting tokens

app.post('/logout',(req,res)=>{
    const token = req.headers.authorization.split(' ')[1]
    blacklistedTokens.insertOne({token:token},(err,data)=>{
        if (err){
            res.sendStatus(500)
        }
        else{
            res.json({message:"Logged out successfully"})
        }
    })
})


app.listen(PORT,(err)=>{
    if(!err){
        console.log(`server successfully running on port ${PORT}`);
    }else{
        console.log("connection failed");
    }

})