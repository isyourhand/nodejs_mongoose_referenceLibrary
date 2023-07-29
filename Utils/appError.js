class AppError extends Error {
    constructor(message, statusCode) {
        super(message); // when we extend a parent class call super in order to call the parent constructor.

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; //Operational errors refer to errors that can be anticipated in the program.For example, incorrect user input.

        Error.captureStackTrace(this, this.constructor); // capture the current call stack information and store it in the stack property of our custom error object.
        // stack will tell us where the error happen.
    }
}

module.exports = AppError;
