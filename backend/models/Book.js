const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    publishYear: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: ["available", "borrowed", "reserved"],
      default: "available",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    notes: [
      {
        type: {
          type: String,
          enum: ["damage", "maintenance", "other"],
        },
        date: Date,
        description: String,
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Kitap silinmeden önce ilişkili ödünç kayıtlarını kontrol et
bookSchema.pre("remove", async function (next) {
  try {
    const Borrow = mongoose.model("Borrow");
    const activeBorrows = await Borrow.find({
      book: this._id,
      status: "active",
    });

    if (activeBorrows.length > 0) {
      throw new Error("Bu kitap şu anda ödünç verilmiş durumda ve silinemez");
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Book", bookSchema);
