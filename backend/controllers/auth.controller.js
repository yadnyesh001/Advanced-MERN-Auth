import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if(!email || !password || !name) {
      return res.status(400).json({message: 'Email and password are required'});
    }
    
    const userAlreadyExists = await User.findOne({ email });
    if(userAlreadyExists) {
      return res.status(400).json({success: false, message: 'User already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({ 
      email, 
      password: hashedPassword, 
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true, 
      message: 'User created successfully',
      user: {
        ...user._doc,
        password: undefined
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({success: false, message: 'Internal server error'});
  }
}

export const login = (req, res) => {
  res.send('Login page');
}

export const logout = (req, res) => {
  res.send('Logout page');
}
