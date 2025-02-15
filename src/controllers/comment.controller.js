import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }

  const videoComments = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        owner: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        likesCount: 1,
        owner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
        isLiked: 1,
      },
    },
  ]);

  if (!videoComments) {
    throw new ApiError(400, "All comments fetched!");
  }
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const comments = await Comment.aggregatePaginate(videoComments, options);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, " Video comments fetched"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content) {
    throw new ApiError(400, "Comment not found!");
  }
  if (!videoId) {
    throw new ApiError(400, "Invalid video id");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user?.id,
  });

  if (!comment) {
    throw new ApiError(400, "Comment not added!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment successfully added!"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { content } = req.body;
  const { commentId } = req.params;

  if (!content) {
    throw new ApiError(400, "Comment not found!");
  }
  if (!commentId) {
    throw new ApiError(400, "Invalid video id");
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  if (!updateComment) {
    throw new ApiError(400, "Comment not updated!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment updated!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Invalid comment id");
  }

  const findComment = Comment.findById(commentId);

  if (!findComment) throw new ApiError(401, "Comment does not exist");

  const deleteComment = await Comment.findByIdAndDelete(commentId);
  if (!deleteComment) {
    throw new ApiError(400, "error deleting comment");
  }

  return res.status(200).json(new ApiResponse(200, "Comment deleted"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
