import BaseService from "./baseService";


class FriendService extends BaseService {
    baseUrl = '/users/friends';

    async addFriend(userId) {
        await this.api.post(
            `${this.baseUrl}/${userId}`
        );
    }

    async acceptFriend(userId) {
        await this.api.patch(
            `${this.baseUrl}/${userId}`
        );
    }

    async removeFriend(userId) {
        await this.api.delete(
            `${this.baseUrl}/${userId}`
        );
    }
}


export default FriendService;
