const NotificationSchema = require("../models/Notification.model");

exports.getNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await NotificationSchema.find({ userId: id });
    if (!data) {
      return res.error({ status: 404, message: "No notification the user" });
    }
    return res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.success({ status: 500, error });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const {id} = req.params
    const {isRead} = req.body
    let data = await NotificationSchema.updateMany(
  { userId:id },
  { $set: { isRead, updatedAt: new Date() } }
);
    if (data) {
      return res.success({
        status: 200,
        data,
        message: "Notification updated",
      });
    } else {
      res.success({ status: 404, data, message: "No notification found" });
    }
  } catch (error) {
    console.log("error in update notification !",error)
    return res.error({ status: 500, error });
  }
};
