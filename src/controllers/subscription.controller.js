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

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(200).json(200, "Subscribed!");
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // const channel  = await User.

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
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1,
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
        },
      },
    },
  ]);

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
