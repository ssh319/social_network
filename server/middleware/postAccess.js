import Post from '../models/postModel.js';


export const checkPostAccess = async (request, response, next) => {
    const post = await Post.findById(request.params.postId);

    if (!post) {
        return response.status(404).json({ errors: { globalError: "Provided post doesn't exist" }});
    }

    if (!post.user.equals(request.user._id)) {
        return response.status(403).json({ errors: { globalError: "Access to the post denied" }});
    }

    next();
}


export const checkCommentAccess = async (request, response, next) => {
    const post = await Post.findById(request.params.postId);

    if (!post) {
        return response.status(404).json({ errors: { globalError: "Provided post doesn't exist" }});
    }

    const comment = post.comments.id(request.params.commentId);

    if (!comment) {
        return response.status(404).json({ errors: { globalError: "Provided post comment doesn't exist" }});
    }

    if (!comment.user.equals(request.user._id)) {
        return response.status(403).json({ errors: { globalError: "You don't have permission to modify this comment" }});
    }

    next();
}
