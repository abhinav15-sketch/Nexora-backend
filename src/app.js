const express = require("express")
const app = express()

const cookieParser = require("cookie-parser")
const cors = require("cors")

const authRoutes = require("./routes/auth.routes")
const aiChatRoutes = require("./routes/ai.chat.routes")

app.use(cors({
	origin: [
	  "https://nexora-self-six.vercel.app"
	  ],
	credentials: true
}));
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/ai/chat", aiChatRoutes)

app.get("/", (req, res) => {
  res.send("Hello backend deployed")
})

module.exports = app