import ClientError from "./clientError.js";


export class NoSuchPostError extends ClientError {
    constructor(message) {
        super(message, 404);
    }
}


export class NoSuchCommentError extends ClientError {
    constructor(message) {
        super(message, 404);
    }
}
