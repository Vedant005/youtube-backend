import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(200, "Invalid video id");
  }
  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked?._id);

    return res.status(200).json(new ApiResponse(200, "Like removed"));
  }

  await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, "Like added"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new ApiError(200, "Invalid comment Id");
  }
  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked?._id);

    return res.status(200).json(new ApiResponse(200, "Like removed"));
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, "Like added"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(200, "Invalid tweet id");
  }

  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked?._id);

    return res.status(200).json(new ApiResponse(200, "Tweet Like removed"));
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res.status(200).json(new ApiResponse(200, "Tweet Liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const likes = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true }, // Ensuring it's a video like
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owners",
              foreignField: "_id",
              as: "owner",
            },
          },
        ],
      },
    },
    {
      $unwind: "$likedVideos",
    },
    {
      $project: {
        _id: "$likedVideos._id",
        videoUrl: "$likedVideos.videoFile.url",
        thumbnailUrl: "$likedVideos.thumbnail.url",
        owner: "$likedVideos.owner",
        views: "$likedVideos.views",
        isPublished: "$likedVideos.isPublished",
        title: "$likedVideos.title",
        description: "$likedVideos.description",
        duration: "$likedVideos.duration",
        createdAt: "$likedVideos.createdAt",
        ownerDetails: {
          username: "$likedVideos.owner.username",
          fullName: "$likedVideos.owner.fullName",
          avatarUrl: "$likedVideos.owner.avatar.url",
        },
      },
    },
    {
      $group: {
        _id: null,
        videos: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        videos: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, likes, "videos likes fetched"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
