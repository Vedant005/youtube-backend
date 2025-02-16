import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (isSubscribed) {
    await Subscription.findByIdAndDelete(isSubscribed?._id);

    return res.status(200).json(new ApiResponse(200, "Unsubscirbed!"));
  }

  const list = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(200).json(new ApiResponse(200, list, "Subscribed!"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const channelId = req.user._id;

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribers: {
                $cond: {
                  if: {
                    $in: [channelId, "$subscribedToSubscriber.subscriber"],
                  },
                  then: true,
                  else: false,
                },
              },
              subscriberCount: {
                $size: "$subscribers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $project: {
        _id: 0,
        channel: {
          _id: 1,
          username: 1,
          fullName: 1,
          "avatar.url": 1,
          subscribers: 1,
          subscriberCount: 1,
        },
      },
    },
  ]);

  if (!channelSubscribers) {
    throw new ApiError(400, "Could not get subbscribers of the channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelSubscribers, "Channel subscribers fetched")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannel",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "_id",
              foreignField: "owner",
              as: "videos",
            },
          },
          {
            $addFields: {
              latestVideo: {
                $last: "$videos",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedChannel",
    },
    {
      $project: {
        _id: 0,
        subscribedChannel: {
          _id: 1,
          username: 1,
          fullName: 1,
          "avatar.url": 1,
          latestVideo: {
            _id: 1,
            "videoFile.url": 1,
            "thumbnail.url": 1,
            owner: 1,
            title: 1,
            description: 1,
            duration: 1,
            createdAt: 1,
            views: 1,
          },
        },
      },
    },
  ]);
  console.log(subscribedChannels);

  if (!subscribedChannels) {
    throw new ApiError(400, "Could not fetched channels");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedChannels, "Subscribed channels fetched! ")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
