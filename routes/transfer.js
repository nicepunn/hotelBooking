const express = require("express");
const bookingRouter = require("./bookings");
const {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  approveTransfer,
} = require("../controllers/transfer");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

router.route("/").get(protect, getTransfers).post(protect, createTransfer);
router
  .route("/:id")
  .get(protect, getTransfer)
  .put(protect, updateTransfer)
  .delete(protect, deleteTransfer);
router.put("/approve/:id", protect, approveTransfer);

module.exports = router;
