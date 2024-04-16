const mongoose = require("mongoose");
const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
      match: [
        /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
        "Please add a valid telephone number",
      ],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Cascade delete bookings when a hotel is deleted
HotelSchema.pre("remove", async function (next) {
  console.log(`Booking being removed from hotel ${this._id}`);
  await this.model("Booking").deleteMany({ hotel: this._id });
  next();
});
// Reverse populate with virtuals
HotelSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "hotel",
  justOne: false,
});
module.exports = mongoose.model("Hotel", HotelSchema);
