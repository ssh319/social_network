export class AlreadyExistsError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


export class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}


export class IncorrectPasswordError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
