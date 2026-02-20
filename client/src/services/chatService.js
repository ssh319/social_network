import BaseService from "./baseService";


class ChatService extends BaseService {
    baseUrl = '/chats';

    async retrieveChats() {
        const response = await this.api.get(
            this.baseUrl
        );

        return response.data.chats;
    }

    async getChat(chatId) {
        const response = await this.api.get(
            `${this.baseUrl}/${chatId}`
        );

        return response.data.chat;
    }

    async getOrCreateChat(userId) {
        const response = await this.api.post(
            `${this.baseUrl}/${userId}`
        );

        return response.data.chat;
    }

    async deleteChat(chatId) {
        await this.api.delete(
            `${this.baseUrl}/${chatId}`
        );
    }

    async sendMessage(chatId, data) {
        const response = await this.api.post(
            `${this.baseUrl}/${chatId}/messages`,
            data
        );

        return response.data.newMessage;
    }

    async editMessage(chatId, messageId, data) {
        await this.api.patch(
            `${this.baseUrl}/${chatId}/messages/${messageId}`,
            data
        );
    }

    async deleteMessage(chatId, messageId) {
        await this.api.delete(
            `${this.baseUrl}/${chatId}/messages/${messageId}`
        );
    }

    async readMessage(chatId, messageId) {
        await this.api.patch(
            `${this.baseUrl}/${chatId}/messages/${messageId}/read`
        );
    }
}


export default ChatService;
