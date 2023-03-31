const express = require('express')
const app = express()
const moment = require('moment')
app.use(express.json())

const transactions = []
const customers = {}

// post API to record all the transactions

app.post('/transactions',(req,res)=>{
  const{amount,source,customerID,date}=req.body

  const transaction = {
    transactionID : transactions.length+1,
    amount,
    source,
    customerID,
    date:moment(date).format()
  }

  transactions.push(transaction)

  if (!customers[customerID]){
    customers[customerID]={
      customerID : customerID,
      balance:0,
      totalExpenses:0,
      totalEarnings:0,
      lastTransactionDate:null

    }
  }

if(amount<0){
  customers[customerID].totalExpenses -= amount
}else{
  customers[customerID].totalEarnings += amount
}

customers[customerID].balance += amount
customers[customerID].lastTransactionDate= moment(date).format()



  res.send("transaction added")
})

// API to list all the transactions 

app.get('/transactions',(req,res)=>{
  res.json(transactions)
})

// app.get('/customers',(req,res)=>{
//   res.json(customers)
// })

// API to list all the customers

app.get('/customers', (req, res) => {
  const customerList = Object.values(customers);

  res.json( customerList );
});

// API to calculate total funds in the bank

app.get('/totalfunds',(req,res)=>{
   
   const totalFunds = transactions.reduce((sum,t)=> sum+t.amount,0)
   res.json({TotalFundsInTheBank: totalFunds})
})

// API to calcualte average balance
 
app.get('/customers/:customerID/average-balance',(req,res)=>{
  const customerID = req.params.customerID
  const currentDate = moment()
  const year = req.query.year || currentDate.year()
  const month = req.query.month || currentDate.month()
  
  const averageBalance = calculateAverageBalance(customerID,year,month)
  res.json({AverageBalance : averageBalance})
})

function calculateAverageBalance(customerID,year,month){
 
  const filteredTransactions = transactions.filter(t=>{
  const currentDate = moment();
  const date = moment(t.date)
  return (
    t.customerID === customerID &&
    date.year() === year &&
    date.month() === month &&
    date.isSameOrBefore(currentDate, 'day') || date.isSame(currentDate, 'day')

  )
  })

  if(filteredTransactions.length === 0){
    return 0;
  }

  const totalTransactions = filteredTransactions.reduce((sum,t)=>sum+t.amount,0)
  const noOfDays = moment(`${year}-${month+1}`,'YYYY-MM').daysInMonth()
  const average = totalTransactions/noOfDays
  return average

}


app.listen(3000,(err)=>{
  if(!err){
    console.log("server connected");
  }
})