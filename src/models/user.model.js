import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
       fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,//cloudinary url
            required: true
        },
        coverImage:{
            type: String //cloudinary url
        },
        watchHistory:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        password:{
            type: String,
            required: [true, 'Password is Required']
        },
        refreshToken:{
            type: String
        }

},{timestamps: true})



// ===>>> Before Save (Check If Password Not Modified Then go to Next Step) otherwise just Hashed Password using bcrypt upto 10 rounds then go to next step..
userSchema.pre('save', async function(next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// ===>>> Check the password field is it correct, check through compare function of bcrypt (bcrypt.compare)..
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

// ===>>> Generate Access Token through usrSchema.methods.generateAccessToken, return in the form of jwt.sign , in jwt return some object...
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            fullname: this.fullName,
            email: this.email
        },
       process.env.ACCESS_TOKEN_SECRET,
       {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// ===>>> Generate Refresh Token through usrSchema.methods.generateRefreshToken, return in the form of jwt.sign , in jwt return some object nd here just _id access...
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User', userSchema)
