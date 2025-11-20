const {getSocket,getUserSockets} = require("../config/socket.config")

exports.dummyController = async (req, res) => {
  const {data} = req.body
  try {
    const socket = getSocket();
    const sockets = getUserSockets(data.id);

    if (sockets.length === 0) {
      return res.error({ status: 404, error: "User not online" });
    }

    sockets.forEach((socketId) => {
      socket.to(socketId).emit("notification:new", {
        message: data.message,
      });
    });


    return res.success({ status: 200 });
  } catch (error) {
    console.log(error)
    return res.error({ status: 500, error });
  }
};
