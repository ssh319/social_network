import ClientError from "./clientError.js";


export class NoSuchImageError extends ClientError {
    constructor(msg, path = "") {
        super(msg, 404, path);
    }
}
