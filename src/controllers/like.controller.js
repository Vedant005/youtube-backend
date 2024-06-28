import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(200,"Invalid video id");

    }
    const alreadyLiked = await Like.findOne({
        video:videoId,
        likedBy:req.user?._id
    })


    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id);

        return res
        .status(200)
        .json(new ApiResponse(200,"Like removed"))
    }

    await Like.create({
        video:videoId,
        likedBy:req.user?._id
    });

    return res
          .status(200)
          .json(new ApiResponse(200,"Like added"))


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
      throw new ApiError(200,"Invalid comment Id")
    }
    const alreadyLiked = await Like.findOne({
        comment:commentId,
        likedBy:req.user?._id
    })
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
              .status(200)
              .json(new ApiResponse(200,"Like removed"))
    }

    await Like.create({
        comment:commentId,
        likedBy:req.user?._id
    })
    
    return res
        .status(200)
        .json(new ApiResponse(200,"Like added"))






})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!isValidObjectId(tweetId)){
        throw new ApiError(200,"Invalid tweet id")
    }

    const alreadyLiked = await Like.findOne({
        tweet : tweetId,
        likedBy:req.user?._id
    })

    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked?._id)

        return res
              .status(200)
              .json(new ApiResponse(200,"Tweet Like removed"))
    }

    await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
    })

    return res
          .status(200)
          .json(new ApiResponse(200, "Tweet Liked"))

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likes = await Like.aggregate([
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from : "videos",
                localField:"video",
                foreignField:"_id",
                as:"likedVideos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owners",
                            foreignField:"_id",
                            as:"owner",
                            
                        }
                    }
                ]
            }
        },
        {
            $project:{
                _id:0,
                likedVideo : {
                    _id:1,
                    "videoFile.url":1,
                    "thumbnail.url":1,
                    owner:1,
                    views:1,
                    isPublished:1,
                    title:1,
                    description:1,
                    duration:1,
                    createdAt:1,
                    ownerDetails:{
                        username:1,
                        fullName:1,
                        "avatar.url":1,
                    }


                }
            }
        }
    ])

    return res
          .status(200)
          .json(
            new ApiResponse(
                200,
                likes,
                "videos likes fetched"
            )
          )

})



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}