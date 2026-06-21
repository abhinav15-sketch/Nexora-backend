const express = require("express")
const router = express.Router()

const auth = require("../middlewares/auth.middleware")
const aiControllers = require("../controllers/ai.chat.controllers")

// CREATE NEW CHAT
router.post("/", auth, aiControllers.newChat)
// FETCH ALL CHATS
router.get("/", auth, aiControllers.getAllChats)
// FETCH ONE CHAT MESSAGES
router.get("/:chatId", auth, aiControllers.getChatMessages)
// SEND MESSAGE TO A CHAT
router.post("/:chatId/message", auth, aiControllers.generateResponse)
// RENAME CHAT
router.patch("/:chatId", auth, aiControllers.renameChat)
//  DELETE CHAT
router.delete("/:chatId", auth, aiControllers.deleteChat)

module.exports = router