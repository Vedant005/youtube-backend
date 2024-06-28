import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body;
    const {videoId} = req.params;

    if(!content){
        throw new ApiError(400,"Comment not found!")
    }
    if(!videoId){
        throw new ApiError(400,"Invalid video id")
    }

    const comment = await Comment.create({
        content,
        video:videoId,
        owner: req.user?.id,

    })

    if(!comment){
        throw new ApiError(400,"Comment not added!")
    }

    return res
           .status(200)
           .json(new ApiResponse(200,comment,"Comment successfully added!"))
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body;
    const {commentId} = req.params;
    
     if(!content){
        throw new ApiError(400,"Comment not found!")
    }
    if(!commentId){
        throw new ApiError(400,"Invalid video id")
    }
    
    const updateComment = Comment.findByIdAndUpdate(
        commentId,
        { 
            $set: {
                content:content,
            },
        },
        {new:true}
        
    )

    if(!updateComment){
        throw new ApiError(400,"Comment not updated!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,updateComment,"Comment updated!"))


})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {content}= req.body;
    const {commentId}=req.params;

     if(!content){
        throw new ApiError(400,"Comment not found!")
    }
    if(!commentId){
        throw new ApiError(400,"Invalid video id")
    }

    const deleteComment = await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(200,new ApiResponse(200,deleteComment,"Comment deleted"))



})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }