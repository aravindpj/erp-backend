exports.dummyController = async (req, res) => {
  try {
    const socket = getSocket();
    socket.emit(
      "notification",
      { userId: "u123", message: "Hello!" },
      (response) => {
        if (response.ok) {
          console.log("Saved id:", response.id);
        } else {
          console.error("Send failed:", response.error);
        }
      }
    );
    return res.success({ status: 200 });
  } catch (error) {
    return res.error({ status: 500, error });
  }
};
