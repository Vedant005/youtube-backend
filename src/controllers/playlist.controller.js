import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if(!name){
        throw new ApiError(400,"Name not found")
    }

    if(!description){
        throw new ApiError(400,"Description not found")
    }

    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(400,"Playlist Creation problem")
    }

    return res
          .status(200)
          .json(new ApiResponse(200,playlist,"Playlist created "))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const userPlaylist = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            },
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"video",
                
                
            }

        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                totalViews: 1,
                updatedAt: 1
            }
        }



    ])

     return res
    .status(200)
    .json(new ApiResponse(200, userPlaylist, "User playlists fetched successfully"));







})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    
    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"Playlist not available")
    }

    const getPlayist = await Playlist.aggregate([

        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                },
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                }
            }
        }
    ])
    
     return res
        .status(200)
        .json(new ApiResponse(200, getPlayist[0], "playlist fetched successfully"));


})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid playlist id")
    }

    const video = await Video.findById(videoId)
    const playlist = await Playlist.findById(playlistId)
    
    if(!video){
        throw new ApiError(400,'Video not found')
    }

    if(!playlist){
        throw new ApiError(400,'PLaylist not found')
    }

    const addToPlaylist = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $addToSet:{
                videos:videoId,
            },
        },
        {new:true}
    )

    if(!addToPlaylist){
        throw new ApiError(400,"Failed to add video")
    }

    return res
          .status(200)
          .json(400,addToPlaylist,"Video added to playlist!")
    
    

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!isValidObjectId(playlist) && !isValidObjectId(videoId)){
        throw new ApiError(400,"Playlist or video id  not found")
    }

    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(200,"Playlist not found!")
    }

    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(200,"Video not found!")
    }

    const remove = await Playlist.findByIdAndDelete(
        playlist?._id,
        {


        }
    )

    if(!remove){
        throw new ApiError(400,"Video could not be removed from thr playlist")
    }

    return res 
           .status(200)
           .json(new ApiResponse(200,"Video removed from playlist!"))



})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,'Playlist id not found')
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if(!playlist){
        throw new ApiError(400,"Playlist not found")
    }

    return res
           .status(200)
           .json(new ApiResponse(200,{},"Playlist deleted!"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    const playlist = await Playlist.findById(playlistId)
    
    if(!playlist){
        throw new ApiError(200,"Playlist not found!")
    }

    if(!name){
        throw new ApiError(200,"Name not found!")
    }

    if(!description){
        throw new ApiError(200,"Description not found!")
    }
    
    const update = await Playlist.findByIdAndUpdate(
        playlist?._id,
        {
            $set:{
                name:name,
                description:description,
            },
        },
        {
            new:true
        }
    )
    
    if(!update){
        throw new ApiError(400,"Playlist could not be updated")
    }

    return res
          .status(200)
          .json(new ApiResponse(200,update,"Playlist updated!"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}