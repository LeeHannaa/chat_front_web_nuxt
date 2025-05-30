import { defineStore } from "pinia";

export interface ChatRoom {
  roomId: number;
  name: string;
  lastMsg?: string;
  updateLastMsgTime?: Date;
  unreadCount?: number;
}

export const useChatListStore = defineStore("chatlist", {
  state: () => ({
    chatList: [] as ChatRoom[],
  }),
  actions: {
    setChatList(newChatList: ChatRoom[]) {
      this.chatList = newChatList.map((chat) => ({
        ...chat,
        updateLastMsgTime: chat.updateLastMsgTime
          ? new Date(chat.updateLastMsgTime)
          : undefined,
      }));
    },
    addChatRoom(chatMessage: ChatRoom) {
      const newChat: ChatRoom = {
        roomId: chatMessage.roomId,
        name: chatMessage.name,
        lastMsg: chatMessage.lastMsg,
        updateLastMsgTime: new Date(
          chatMessage.updateLastMsgTime ?? Date.now()
        ),
        unreadCount: chatMessage.unreadCount,
      };
      this.chatList.push(newChat);
    },
    updateChatRoom(chatMessage: ChatRoom, index: number) {
      if (index !== -1) {
        this.chatList[index] = {
          ...this.chatList[index],
          name: this.chatList[index].name ?? chatMessage.name,
          lastMsg: chatMessage.lastMsg,
          updateLastMsgTime: new Date(
            chatMessage.updateLastMsgTime ?? Date.now()
          ),
          unreadCount: chatMessage.unreadCount,
        };
      }
    },
    sortChatListByLastMsgTime() {
      this.chatList.sort(
        (a, b) =>
          b.updateLastMsgTime!.getTime() - a.updateLastMsgTime!.getTime()
      );
    },
  },
});
