import ClientError from "./clientError.js";


export class NoSuchImageError extends ClientError {
    constructor(message) {
        super(message, 404);
    }
}
