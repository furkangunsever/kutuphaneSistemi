const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "returned", "overdue"],
      default: "active",
    },
    returnCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor", "damaged"],
      default: "good",
    },
    notes: String,
    notificationSent: {
      type: Boolean,
      default: false,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Otomatik olarak gecikmiş durumunu kontrol et
borrowSchema.pre("save", function (next) {
  if (this.status === "active" && this.dueDate < new Date()) {
    this.status = "overdue";
  }
  next();
});

module.exports = mongoose.model("Borrow", borrowSchema);
