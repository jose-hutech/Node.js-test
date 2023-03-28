const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {MongoClient} = require('mongodb')
const PORT = 3000
const app =express()
const uri= '**********************'

// cluster firstproject

 const client = new MongoClient(uri,{ useNewUrlParser:true ,useUnifiedTopology:true})
//const client = new MongoClient(uri)

let users,blacklistedTokens,posts

//console.log("jdjfjfj",client);

client.connect()
  .then(() => {
    console.log("Connected to MongoDB database")
    const db = client.db("LoginDatabase")
    users = db.collection("users")
    posts = db.collection("posts")
    blacklistedTokens = db.collection("expireTokens")
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB database") 
    process.exit(1)
  })

app.use(express.json())

//Display the posts

app.get('/posts',authenticateToken,async(req,res)=>{
   // console.log("pppppppppppp",posts)
 const posts1 = await posts.find({}).toArray()
  try{ 
    res.json(posts1)

  }catch(err){
   console.log(err);
  }

})

// Display the registered users

app.get('/register',async(req,res)=>{
  const users1 =  await users.find({}).toArray()
   try{
       res.json(users1)
   }catch(err){
    console.log(err)
   }
})

// Display the blacklisted tokens

app.get('/expiretokens',async(req,res)=>{
  const blackTokens =await  blacklistedTokens.find({}).toArray()
   try{
    res.json(blackTokens)
   }catch(err){
    console.log(err);
   }

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
try{  
    const user = {username,password:hashedPassword}
   //console.log("uuuuuuuuuuuuuuuuusssssssssss",users);
  await users.insertOne(user)
   res.status(201).send("Registered")
}
    catch(err){
        console.log(err);
    }
     
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

async function authenticateToken (req,res,next){
    const authHeader = req.headers.authorization
    const token = authHeader.split(' ')[1]

    if (token==null){
       return res.sendStatus(400)
    }
try{
  await  blacklistedTokens.findOne({token:token})
            jwt.verify(token,"mysecretkey")
                 //   req.user=user
                    next()
                }

    catch(err){
        console.log(err);
    }
}


//logging out users and blacklisting tokens

app.post('/logout',async(req,res)=>{
    const token = req.headers.authorization.split(' ')[1]
   await blacklistedTokens.insertOne({token:token})
   try{
    res.json({message:"Logged out Successfully"})
   }
   catch(err){
    console.log(err)
   }
})


app.listen(PORT,(err)=>{
    if(!err){
        console.log(`server successfully running on port ${PORT}`);
    }else{
        console.log("connection failed");
    }

})
