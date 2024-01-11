const errorHandler = (err, req, res, next) => {
    console.log("error happend, middleware");
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    if (!res.headersSent) {
        res.status(statusCode).json({
            message: err.message,
            stack: process.env.NODE_ENV === "development" ?  err.stack : null
        });
    }
}

module.exports = errorHandler;