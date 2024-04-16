const mongoose = require("mongoose");

const TransferSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.ObjectId,
    ref: "Booking",
    required: true,
    unique: true,
  },
  receiverApproval: {
    type: Boolean,
    default: false,
  },
  adminApproval: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Transfer", TransferSchema);
