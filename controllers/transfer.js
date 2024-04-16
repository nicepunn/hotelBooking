const Transfer = require("../models/Transfer");
const Booking = require("../models/Booking");

//@desc     Get all transfers
//@route    GET /api/v1/transfers
//@access   Private
exports.getTransfers = async (req, res, next) => {
  let query;

  if (req.user.role !== "admin") {
    query = Transfer.find({
      sender: req.user.id,
    });
  } else {
    query = Transfer.find();
  }
  try {
    const tranfers = await query;
    res.status(200).json({
      success: true,
      count: tranfers.length,
      data: tranfers,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Tranfers" });
  }
};

//@desc     Get single transfer
//@route    Get /api/v1/transfers/:id
//@access   Private
exports.getTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: `No transfer with the id of ${req.params.id}`,
      });
    }

    if (
      req.user.role !== "admin" &&
      transfer.sender.toString() !== req.user.id &&
      transfer.receiver.toString() !== req.user.id
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorize to this route" });
    }

    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Transfer" });
  }
};

//@desc     Create single transfer
//@route    POST /api/v1/tranfers
//@access   Private
exports.createTransfer = async (req, res, next) => {
  try {
    const sender = req.user.id;
    const receiver = req.body.receiver;
    const bookingId = req.body.bookingId;
    const transfer = new Transfer({
      sender: sender,
      receiver: receiver,
      bookingId: bookingId,
    });

    const response = await transfer.save();

    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

//@desc     Update transfer
//@route    PUT /api/v1/transfers/:id
//@access   Private
exports.updateTransfer = async (req, res, next) => {
  try {
    let transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: `No transfer with the id of ${req.params.id}`,
      });
    }
    if (
      transfer.sender.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this transfer`,
      });
    }

    transfer = await Transfer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot update transfer",
    });
  }
};

//@desc     Delete transfer
//@route    DELETE /api/v1/transfers/:id
//@access   Private
exports.deleteTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: `No transfer with the id of ${req.params.id}`,
      });
    }
    if (
      transfer.sender.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this transfer`,
      });
    }
    await transfer.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete transfer",
    });
  }
};

//@desc     Approve transfer
//@route    PUT /api/v1/transfers/approve/:id
//@access   Private
exports.approveTransfer = async (req, res, next) => {
  try {
    let transfer = await Transfer.findById(req.params.id);
    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: `No transfer with the id of ${req.params.id}`,
      });
    }

    if (req.body.approval === "Approved") {
      if (req.user.id === transfer.receiver.toString()) {
        transfer = await Transfer.findByIdAndUpdate(
          req.params.id,
          { receiverApproval: true },
          {
            new: true,
            runValidators: true,
          }
        );
      } else {
        transfer = await Transfer.findByIdAndUpdate(
          req.params.id,
          { adminApproval: true },
          {
            new: true,
            runValidators: true,
          }
        );
      }
    } else {
      await transfer.remove();
      return res.status(200).json("Rejected and deleted transfer");
    }

    let booking = await Booking.findById(transfer.bookingId);

    if (transfer.receiverApproval && transfer.adminApproval) {
      booking = await Booking.findByIdAndUpdate(
        transfer.bookingId,
        { user: transfer.receiver },
        {
          new: true,
          runValidators: true,
        }
      );
      await transfer.remove();
    } else {
      return res.status(200).json({
        success: true,
        message: `Wait for ${
          transfer.adminApproval ? "receiver" : "admin"
        } approval`,
      });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot approve transfer",
    });
  }
};
