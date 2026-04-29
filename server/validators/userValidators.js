import {
    body,
    checkExact,
    query,
    validationResult
} from 'express-validator';

import { isValidObjectId } from 'mongoose';


const capitalize = (value) => {
    if (value && typeof value === 'string') {
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    return value;
}


const deleteOptionalField = (value) => {
    if (typeof value === 'string' && !value) {
        return null;
    }

    return value;
}


const isRequired = (value, { req }) => {
    if (req.method === 'POST') {
        return typeof value === 'string';
    }
    
    return true;
}


const checkOldPassword = (value, { req }) => {
    if (req.method === 'PATCH' && req.body.password) {
        return typeof value === 'string';
    }

    return true;
}


const isValidBirthDate = (value) => {
    return (value > new Date('1900-01-01')) && (value < new Date());
}


const sanitizeSearchField = (value) => {
    return value.replace(/[*$\\]/g, "");
}


export const validateUserId = (request, response, next) => {
    if (!isValidObjectId(request.params.userId)) {
        return response.status(400).json({ errors: { userId: "Invalid user id provided" }});
    }

    next();
}


export const validateUserData = [

    body("email")
        .custom(isRequired).withMessage("Email address required").bail({ level: "request" }),

    body("email")
        .optional()
        .isEmail().withMessage("Invalid email address").bail()
        .toLowerCase(),

    body("password")
        .custom(isRequired).withMessage("Password required").bail({ level: "request" }),

    body("password")
        .optional()
        .isString().withMessage("Invalid data type for password").bail()
        .notEmpty().withMessage("Empty password provided").bail()
        // make both checks with one .withMessage()
        .matches(/^\S+$/).withMessage("Password cannot include whitespaces")
        .isLength({ min: 8 }).withMessage("Password must contain at least 8 characters"),
        // check is containing lowcase, upcase & symbol

    body("oldPassword")
        .custom(checkOldPassword).withMessage("For password changing you need to provide the old one"),

    body("oldPassword")
        .optional()
        .isString().withMessage("Invalid data type for old password confirmation"),

    body("firstName")
        .custom(isRequired).withMessage("First name required").bail({ level: "request" }),

    body("firstName")
        .optional()
        .isString().withMessage("Invalid data type for first name").bail()
        .trim()
        // accepts latin only yet (use regexp) & one .withMessage()
        .isAlpha().withMessage("First name can contain letters only")
        .isLength({ max: 24 }).withMessage("First name cannot be more than 24 characters in length")
        .customSanitizer(capitalize),

    body("lastName")
        .custom(isRequired).withMessage("Last name required").bail({ level: "request" }),

    body("lastName")
        .optional()
        .isString().withMessage("Invalid data type for last name").bail()
        .trim()
        // accepts latin only yet (use regexp) & one .withMessage()
        .isAlpha().withMessage("Last name can contain letters only")
        .isLength({ max: 24 }).withMessage("Last name cannot be more than 24 characters in length")
        .customSanitizer(capitalize),

    body("publicStatus")
        .optional()
        .isString().withMessage("Invalid data type for public status").bail()
        .isLength({ max: 200 }).withMessage("Public status cannot be more than 200 characters in length")
        .customSanitizer(deleteOptionalField),

    body("country")
        .optional()
        .isString().withMessage("Invalid data type for country").bail()
        // check is letters & whitespaces only (regex?)
        .isLength({ max: 30 }).withMessage("Country name cannot be more than 30 characters in length")
        .customSanitizer(deleteOptionalField),

    body("city")
        .optional()
        .isString().withMessage("Invalid data type for city").bail()
        .isLength({ max: 30 }).withMessage("City name cannot be more than 30 characters in length")
        .customSanitizer(deleteOptionalField),

    body("birthDate")
        .customSanitizer(deleteOptionalField)
        .optional({ values: 'null' })
        .isISO8601().withMessage("Invalid data format for birth date").bail()
        .toDate()
        .custom(isValidBirthDate).withMessage("Invalid birth date provided"),

    body("aboutMe")
        .optional()
        .isString().withMessage("Invalid data type for 'about' info").bail()
        .isLength({ max: 500 }).withMessage("'About' information text cannot be more than 500 characters in length")
        .customSanitizer(deleteOptionalField),

    body("profilePicture")
        .optional()
        .customSanitizer(deleteOptionalField),

    checkExact(),

    (request, response, next) => {

        const validationErrors = validationResult(request);

        if (!validationErrors.isEmpty()) {
            return response.status(400).json({
                errors: validationErrors.errors.reduce((acc, { path, msg }) => {
                    acc[path] = msg;
                    return acc;
                }, {})
            });
        }
        
        next();
    }
]


export const validateUserAuth = [

    body("email")
        .exists().withMessage("Email address required").bail()
        .isEmail().withMessage("Invalid email address")
        .toLowerCase(),

    body("password")
        .exists().withMessage("Password required").bail()
        .isString().withMessage("Invalid data type for password").bail()
        .notEmpty().withMessage("Empty password provided"),

    checkExact(),

    (request, response, next) => {

        const validationErrors = validationResult(request);
        
        if (!validationErrors.isEmpty()) {
            return response.status(400).json({
                errors: validationErrors.errors.reduce((acc, { path, msg }) => {
                    acc[path] = msg;
                    return acc;
                }, {})
            });
        }

        next();
    }
]


export const validateSearchQuery = [
    query("firstName")
        .optional()
        .isString().withMessage("Invalid data type for first name")
        .customSanitizer(sanitizeSearchField),

    query("lastName")
        .optional()
        .isString().withMessage("Invalid data type for last name")
        .customSanitizer(sanitizeSearchField),

    query("country")
        .optional()
        .isString().withMessage("Invalid data type for country")
        .customSanitizer(sanitizeSearchField),

    query("city")
        .optional()
        .isString().withMessage("Invalid data type for city")
        .customSanitizer(sanitizeSearchField),

    checkExact(),

    (request, response, next) => {
        const validationErrors = validationResult(request);

        if (!validationErrors.isEmpty()) {
            return response.status(400).json({
                errors: validationErrors.errors.reduce((acc, { path, msg }) => {
                    acc[path] = msg;
                    return acc;
                }, {})
            });
        }

        next();
    }
]
