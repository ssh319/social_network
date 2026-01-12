import ClientError from "./clientError.js";


export class NoSuchPostError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 404, path);
    }
}


export class NoSuchCommentError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 404, path);
    }
}
