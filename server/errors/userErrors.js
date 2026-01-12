import ClientError from "./clientError.js";


export class AlreadyExistsError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 400, path);
    }
}


export class NoSuchResourceError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 404, path);
    }
}


export class IncorrectPasswordError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 401, path);
    }
}


export class IncorrectOldPasswordError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 403, path);
    }
}
