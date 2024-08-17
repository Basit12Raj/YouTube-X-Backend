import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    /*
    ==>> Algorithm:
    1-Extracts the token from cookies or the Authorization header.
    2-Verifies the token.
    3-Retrieves the user associated with the token from the database.
    4-Attaches the user to the request object.
    5-Passes control to the next middleware or route handler.
    */

    try {
        const token =
          req.cookies?.accessToken ||
          req.headers["authorization"]?.replace("Bearer ", "");
    
        if (!token) {
          throw new ApiError(403, "Access token missing required ");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select(
          "-password -refreshToken"
        );
    
        if (!user) {
          throw new ApiError(403, "User not found");
        }
    
        req.user = user;
        next();
      } catch (error) {
        throw new ApiError(402, error?.message || "invalid access token");
      }
  
});
