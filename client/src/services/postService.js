import BaseService from "./baseService";


class PostService extends BaseService {
    baseUrl = '/posts';

    async getPostsFeed() {
        const response = await this.api.get(
            `${this.baseUrl}/feed`
        );

        return response.data.posts;
    }

    async getPost(postId) {
        const response = await this.api.get(
            `${this.baseUrl}/${postId}`
        );

        return response.data.post;
    }

    async createPost(data) {
        const response = await this.api.post(
            this.baseUrl,
            data
        );

        return response.data.createdPost;
    }

    async deletePost(postId) {
        await this.api.delete(
            `${this.baseUrl}/${postId}`
        );
    }

    async likePost(postId) {
        await this.api.post(
            `${this.baseUrl}/${postId}/likes`
        );
    }

    async unlikePost(postId) {
        await this.api.delete(
            `${this.baseUrl}/${postId}/likes`
        );
    }

    async sendPostComment(postId, data) {
        await this.api.post(
            `${this.baseUrl}/${postId}/comments`,
            data
        );
    }

    async editPostComment(postId, commentId, data) {
        await this.api.patch(
            `${this.baseUrl}/${postId}/comments/${commentId}`,
            data
        )
    }

    async deletePostComment(postId, commentId) {
        await this.api.delete(
            `${this.baseUrl}/${postId}/comments/${commentId}`
        );
    }

    async likePostComment(postId, commentId) {
        await this.api.post(
            `${this.baseUrl}/${postId}/comments/${commentId}/likes`
        );
    }

    async unlikePostComment(postId, commentId) {
        await this.api.delete(
            `${this.baseUrl}/${postId}/comments/${commentId}/likes`
        );
    }
}


export default PostService;
