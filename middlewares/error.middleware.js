module.exports = (err, req, res, next) => {
  console.log(
    "Error Middleware",
    err,
    // err,
    // err?.response,
    // err?.status,
    // err?.message,
    // err?.name,
    // err?.stack
  );
  // console.log("Error Middleware3", err?.message);

  if (err?.status === 401) {
    return res.status(err.status).json({
      success: false,
      message: "Unauthorized",
    });
  }
  res.status(500).json({
    success: false,
    message: "Something went wrong",
    data: {
      status: err?.status,
      message: err?.message,
      name: err?.name,
      stack: err?.stack,
    },
  });
};
