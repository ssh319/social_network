import ClientError from "./clientError.js";


export class AlreadyExistsError extends ClientError {
    constructor(message) {
        super(message, 400);
    }
}


export class NoSuchResourceError extends ClientError {
    constructor(message) {
        super(message, 404);
    }
}


export class IncorrectPasswordError extends ClientError {
    constructor(message) {
        super(message, 400);
    }
}
