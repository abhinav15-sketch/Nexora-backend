const mongoose = require("mongoose")

async function connectDB(){
  try{
    await mongoose.connect(process.env.MONGO_URI)
    console.log("Database is connected")
  }catch(error){
    console.error("Database not connected: ", error)
  }
}

module.exports = connectDB