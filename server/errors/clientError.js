class ClientError extends Error {
    constructor(msg, statusCode, path = "") {
        super(msg);
        this.msg = msg;
        this.statusCode = statusCode;
        this.path = path || "globalError";
        this.name = this.constructor.name;
    }
}


export default ClientError;
