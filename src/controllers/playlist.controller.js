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





})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid playlist id")
    }
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

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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