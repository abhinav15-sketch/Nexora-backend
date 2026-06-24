const { GoogleGenAI } = require("@google/genai")
const chatModel = require("../models/chat.model")

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

async function newChat (req, res) {
  try{
    const chat = await chatModel.create({
      userId: req.user._id,
      title: "New chat",
      messages: []
    })
    return res.status(201).json({
      message: "New chat created successfully",
      chat,
      chatId: chat._id
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Something went wrong"
    })
  }
}

async function generateResponse (req, res) {
  try {
		const { prompt } = req.body
		const chatId = req.params.chatId
		
		if (!prompt || !prompt.trim()) {
    	return res.status(400).json({
    		message: "Prompt is required"
    	});
    }
		
		const chat = await chatModel.findOne({
		  _id: chatId,
		  userId: req.user._id
		})
		if (!chat) {
		  return res.status(404).json({message: "Chat not found"})
		}
		
		if(chat.messages.length === 0 && chat.title === "New chat") {
		  const title = await ai.models.generateContent({
		    model: "gemini-2.5-flash",
		    contents: `Generate a consise title(max 5 words). Return title only no extra words
		    Message: ${prompt}`
		  })
		  chat.title = title.text.trim()
		}
		
		chat.messages.push({
		  role: "user",
		  text: prompt
		})
		
		const contents = chat.messages.slice(-20).map(msg => ({
		  role: msg.role,
		  parts: [{ text: msg.text }]
		}))
		const response = await ai.models.generateContent({
			model: "gemini-2.5-flash",
			contents: contents
		})
		chat.messages.push({
		  role: "model",
		  text: response.text
		})
		
		await chat.save()
		
		return res.status(200).json({
			reply: response.text,
			title: chat.title
		})
	} catch (error) {
	  console.error(error)
	  return res.status(500).json({
	    error: "Something went wrong",
	    error_message: {
	      name: error.name,
	      status: error.status,
	      message: error.message
	    }
	  })
	}
}

async function getAllChats (req, res) {
	try {
		const chats = await chatModel
			.find({ userId: req.user._id })
			.select("_id title")
			.sort({ updatedAt: -1 });
		
		return res.status(200).json({
			chats
		});
	} catch (error) {
	  console.error(error)
		return res.status(500).json({
			message: "Something went wrong"
		});
	}
}

async function getChatMessages (req, res) {
  try{
    const chat = await chatModel.findOne({
      _id: req.params.chatId,
      userId: req.user._id
    })
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      })
    }
    return res.status(200).json({
      chat
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: "Something went wrong"
    })
  }
}

async function renameChat (req, res) {
  const { title } = req.body
  const { chatId } = req.params
  if (!title || !title.trim()) {
    return res.status(400).json({
      message: "Title is required"
    })
  }
  try{
    const chat = await chatModel.findOneAndUpdate({
      _id: chatId,
      userId: req.user._id
    },
    { title: title.trim() },
    { returnDocument: "after" }
    )
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      })
    }
    return res.status(200).json({
      message: "Chat renamed successfully",
      chat
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Something went wrong"
    })
  }
}

async function deleteChat (req, res) {
  const chatId = req.params.chatId
  try{
    const chat = await chatModel.findOneAndDelete({
      _id: chatId,
      userId: req.user._id
    })
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      })
    }
    return res.status(200).json({
      message: "Chat deleted successfully"
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      message: "Something went wrong"
    })
  }
}

module.exports = { generateResponse, newChat, getAllChats, getChatMessages, renameChat, deleteChat }