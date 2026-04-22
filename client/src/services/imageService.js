import BaseService from './baseService';


class ImageService extends BaseService {
    baseUrl = '/images';

    async getImage(imageId) {
        const response = await this.api.get(
            `${this.baseUrl}/${imageId}`
        );

        return response.data.image;
    }

    async uploadImage(data) {
        const response = await this.api.post(
            this.baseUrl,
            data
        );
        
        return response.data;
    }

    async deleteImage(imageId) {
        await this.api.delete(
            `${this.baseUrl}/${imageId}`
        );
    }

    async likeImage(imageId) {
        await this.api.post(
            `${this.baseUrl}/${imageId}/likes`
        );
    }
    
    async unlikeImage(imageId) {
        await this.api.delete(
            `${this.baseUrl}/${imageId}/likes`
        );
    }
}


export default ImageService;
