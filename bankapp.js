const { MongoClient } = require("mongodb");
const uri ='sampleurijdjhf';
const client = new MongoClient(uri);
console.log("connected");



async function customerInfo (){
 try{   
const db = client.db("bankdb");
const collection =await db.collection("employeeInfo");
const insert = await collection.insertMany({name:"jose",accountBalance:120000,
totalExpenses:600000,totalEarnings:800000,lastTransactionDate:"12-03-2023"},
{name:"chris",accountBalance:130000,
totalExpenses:500000,totalEarnings:700000,lastTransactionDate:"14-03-2023"},
{name:"tom",accountBalance:140000,
totalExpenses:700000,totalEarnings:800000,lastTransactionDate:"13-03-2023"})

 }finally{
    await client.close();
}

}

customerInfo();

let collection1 = await collection("EmployeeBalances")
await collection1.insertMany({_id:1,balance:120000},{_id:2,balance:130000},
    {_id:3,balance:150000})
let balances = await db.collection1.find()

function calculateAverageBalance(balances) {
    let totalBalance = balances.reduce((acc, cur) => acc + cur, 0);
    let averageBalance = totalBalance / balances.length;
    return averageBalance;
  }


calculateAverageBalance() 

let collection2 = await collection("employeeInfo")
const customers = await db.collection1.find()


function calculateTotalFunds(customers) {
    let totalBalance = 0;
    for (let i = 0; i < customers.length; i++) {
      totalBalance += customers[i].balance;
    }
    return totalBalance;
  }

  calculateTotalFunds()