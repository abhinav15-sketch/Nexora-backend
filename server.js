require("dotenv").config()
const app = require("./src/app")
const connectDB = require("./src/DB/db")

connectDB()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})