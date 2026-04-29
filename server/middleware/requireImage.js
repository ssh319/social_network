const requireImage = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ errors: { globalError: "Image file is required" } });
    }

    next();
}


export default requireImage;
