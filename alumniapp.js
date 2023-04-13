const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.use(express.json())
const PORT = 3000

/* 
MongoDB Atlas link : https://cloud.mongodb.com/v2/63da17e324227b52b5cb4082#/metrics/replicaSet/63da183e71017e2af5142a0a/explorer/test/employees/find
databace name : test
collections name : awards && employees
*/
// DB connection

const uri = 'mongodb+srv://chris:chris-123@cluster0.3nvcklr.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true})

const db = mongoose.connection;

db.on('error',()=>{ console.log("connection failed")});
db.once('open', ()=> {
  console.log('Connected to MongoDB');
});

// Schemas for employees and awards

const employeeSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
     technology: {
      type: String,
      required: true
    },
    experience: {
      type: Number,
      required: true
    },
    awards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Award'
      }]
   });

   const Employee = mongoose.model('Employee', employeeSchema);

   const awardSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    active: {
        type: Boolean,
        default: true
      }
  })

  const Award = mongoose.model('Award', awardSchema)


// Employee Registration

  app.post('/employees', async (req, res) => {
    const { name,technology,experience } = req.body;
    const employee = new Employee({ name,technology,experience });
    try {
      await employee.save();
      res.status(201).send(employee);
    } catch (error) {
      res.status(400).send(error);
    }
  })

  // Listing all Employees


app.get('/employees', async (req, res) => {
    try {
      const employees = await Employee.find();
      res.send(employees);
    } catch (error) {
      res.status(500).send();
    }
  })

  // Creating awards

  app.post('/awards', async (req, res) => {
    const { title,description } = req.body;
    const award = new Award({title,description});
    try {
      await award.save();
      res.status(201).send(award);
    } catch (error) {
      res.status(400).send(error);
    }
  })

  // listing all awards 
  
  app.get('/awards', async (req, res) => {
    try {
      const awards = await Award.find();
      res.send(awards);
    } catch (error) {
      res.status(500).send();
    }
  });
  

  // Assign an award to an employee



app.post('/employees/:id/awards', async (req, res) => {
  const { awardId } = req.body;
  try {
    const award = await Award.findById(awardId); // retrieve award from db
    if (!award) {
      throw new Error('Award not found');
    }
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $push: { awards: award._id } },
      { new: true }
    );
    res.status(201).send(employee);
  } catch (error) {
    res.status(400).send(error);
  }
})

// Updating  employee details 

app.patch('/employees/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'technology', 'experience'];
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
  
    if (!isValidUpdate) {
      return res.status(400).send({ error: 'Invalid update' });
    }
  
    try {
      const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!employee) {
        return res.status(404).send();
      }
      res.send(employee);
    } catch (error) {
      res.status(400).send(error);
    }
  });

  // listing employees who was awarded a particular award


app.get('/awards/:awardId/employees', async (req, res) => {
  try {
    const employees = await Employee.find({ awards: req.params.awardId }).populate('awards');
    res.send(employees);
  } catch (error) {
    res.status(500).send();
  }
});

// disable  a employee or remove a employee

app.delete('/employees/:id', async (req, res) => {
    try {
      const employee = await Employee.findByIdAndDelete(req.params.id);
      if (!employee) {
        return res.status(404).send();
      }
      res.send(employee);
    } catch (error) {
      res.status(500).send();
    }
  });



// Disable an award


app.patch('/awards/:id/disable', async (req, res) => {
    try {
      const award = await Award.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
      if (!award) {
        return res.status(404).send();
      }
      res.send(award);
    } catch (error) {
      res.status(400).send(error);
    }
  });
  
  
 app.listen(PORT,(err)=>{
    if(!err){
        console.log(`server successfully connected on port ${PORT}`);
    }else{
        console.log("connection failed");
    }
  })
