import ClientError from "./clientError.js";


export class NoSuchPostError extends ClientError {
    constructor(message) {
        super(message, 404);
    }
}
