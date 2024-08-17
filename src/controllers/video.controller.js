import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = await req.file?.path
    if (!videoLocalPath) {
        throw new ApiError(400, "File not found")
    }

    const video = await uploadOnCloudinary(videoLocalPath)

    if (!video?.url) {
        throw new ApiError(400, "Video url not found")
    }

    // Ensure userId is available
    if (!req.user?._id) {
        throw new ApiError(400, "User not authenticated");
    }

    const newVideo = new Video({
        title,
        description,
        thumbnail: video.url,
        userId: req.user?._id
    })

    await newVideo.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200, "video published successfully", newVideo)
    )


})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description, thumbnail } = req.body
    //TODO: update video details like title, description, thumbnail

   const video =  Video.findById(videoId)

   if (!video) {
      throw new ApiError(403, "No video found")
   }


   const updateVideo = await Video.findByIdAndUpdate(videoId, {
    $set: {
        title,
        description, 
        thumbnail
    },
   },{
    new: true
   })

   await updateVideo.save()

   return res
   .status(200)
   .json(
        new ApiResponse(200, "video updated successfully", updateVideo)
    )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid video id provided")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(403, "No video found")
    }

    const userId = req.user._id;
    if (video.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to delete a video")
    }


    await Video.findByIdAndDelete(videoId)

    await uploadOnCloudinary.deleteVideo(video.videoUrl)

    res.status(200).json(new ApiResponse("video deleted successfully", true))



})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid ObjectId ")
    }

   const video = await Video.findById(videoId)

   if (!video) {
    throw new ApiError(403, "video not found")
   }

   if (req.user.id !== video.userId.toString()) {
    throw new ApiError(403, "user are not authorized to access this video")
   }

   video.isPublished = !video.isPublished

   await video.save()

   res.status(200).json(new ApiResponse("video published status updated successfully", video))



})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
