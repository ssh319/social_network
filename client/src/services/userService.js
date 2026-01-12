import qs from 'qs';

import BaseService from "./baseService";


class UserService extends BaseService {
    baseUrl = '/users';
    
    async searchUsers(query) {
        const response = await this.api.get(
            `${this.baseUrl}?${qs.stringify(query)}`
        );
        
        return response.data.users;
    }

    async getUser(userId) {
        const response = await this.api.get(
            `${this.baseUrl}/${userId}`,
        );

        return response.data.user;
    }

    async getAccountData() {
        const response = await this.api.get(
            `${this.baseUrl}/account`
        );

        return response.data.user;
    }

    async createUser(data) {
        const response = await this.api.post(
            `${this.baseUrl}/signup`,
            data
        );

        return response.data.createdUser;
    }

    async authenticateUser(data) {
        const response = await this.api.post(
            `${this.baseUrl}/login`,
            data
        );

        return response.data.token;
    }

    async updateUser(data) {
        await this.api.patch(
            `${this.baseUrl}/account`,
            data,
        );
    }

    async deleteUser() {
        await this.api.delete(
            `${this.baseUrl}/account`,
        );
    }

    async updateOnline() {
        await this.api.patch(
            `${this.baseUrl}/update_online`
        );
    }
}


export default UserService;
