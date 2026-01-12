import ClientError from "./clientError.js";


export class AccessDeniedError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 403, path);
    }
}


export class NoSuchUserError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 404, path);
    }
}
