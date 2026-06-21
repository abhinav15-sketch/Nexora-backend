const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      trim: true,
      default: "New chat"
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "model"],
          required: true
        },
        text: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

const chatModel = mongoose.model("Chat", chatSchema)

module.exports = chatModel