import ClientError from "./clientError.js";


export class AccessDeniedError extends ClientError {
    constructor(message) {
        super(message, 403);
    }
}
