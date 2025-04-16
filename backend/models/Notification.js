const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["return_reminder", "overdue", "system", "other"],
      default: "other",
    },
    relatedItem: {
      itemType: {
        type: String,
        enum: ["book", "borrow"],
        required: false,
      },
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema); 