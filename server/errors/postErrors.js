import ClientError from "./clientError.js";


export class NoSuchResourceError extends ClientError {
    constructor(message) {
        super(message, 404);
    }
}
