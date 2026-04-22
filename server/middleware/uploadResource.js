import multer from 'multer';
import path from 'path';
import crypto from 'crypto';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + crypto.randomUUID() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    
    } else {
        cb(new Error('Only images allowed'), false);
    }
}

const uploadResource = multer({ storage, fileFilter });


export default uploadResource;
