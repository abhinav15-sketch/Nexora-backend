const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const userModel = require("../models/user.model")

async function registerUser(req, res){
  try{
    const { username, email, password, role = "user" } = req.body
    
    if (!username || !email || !password){
      return res.status(400).json({
        message: "Username, email and password are required"
      })
    }
    if (role !== "user" && role !== "admin"){
      return res.status(400).json({
        message: "Invalid role"
      })
    }
    
    const isUserAlreadyExists = await userModel.findOne({
      $or:[
        { username },
        { email }
        ]
    })
    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "User already exists"
      })
    }
    
    const hash = await bcrypt.hash(password, 10)
    
    const user = await userModel.create({
      username, email, password: hash, role
    })
    
    const token = jwt.sign({
      _id: user._id,
      role: user.role
    }, process.env.JWT_SECRET)
    
    res.cookie("token", token, {
    	httpOnly: true,
    	secure: true,
    	sameSite: "none",
    	maxAge: 24 * 60 * 60 * 1000
    });
    
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  }catch(error){
    console.log("Error in registerUser: ", error)
    res.status(500).json({
      message: "Internal server error"
    })
  }
}

async function loginUser(req, res){
  try{
    const { identifier, password } = req.body
    const user = await userModel.findOne({
      $or:[
        { username: identifier },
        { email: identifier }
      ]
    })
    if (!user){
      return res.status(401).json({
        message: "User not found, Invalid credentials"
      })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid){
      return res.status(401).json({ message: "Incorrect password" })
    }
    const token = jwt.sign({
      _id: user._id,
      role: user.role
    }, process.env.JWT_SECRET)
    
    res.cookie("token", token, {
    	httpOnly: true,
    	secure: true,
    	sameSite: "none",
    	maxAge: 24 * 60 * 60 * 1000
    });
    
    return res.status(200).json({
      message:"User Logged in successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  }catch(error){
    console.log("Error in loginUser", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

function verifyAuth(req, res, next) {
	try {
		const token = req.cookies.token;
		if (!token) {
			return res.status(401).json({
				message: "Unauthorized"
			});
		}
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET
		);
		req.user = decoded;
		return res.status(200).json({
			user: decoded
		})
	} catch (error) {
		return res.status(401).json({
			message: "Invalid token"
		});
	}
}

async function logoutUser(req, res){
	res.clearCookie("token", {
		httpOnly: true,
		secure: true,
		sameSite: "none"
	})
	
	return res.status(200).json({
		message: "Logged out successfully"
	})
}

module.exports = { registerUser, loginUser, verifyAuth, logoutUser }