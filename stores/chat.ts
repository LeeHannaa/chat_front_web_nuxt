import { defineStore } from "pinia";

export interface Chat {
  id: number;
  writerId: number;
  writerName: string;
  createdDate: string;
  roomId: number;
  msg?: string;
  delete?: boolean;
  unreadCount?: number;
  beforeMsgId?: number;
  type?: string;
}
export interface postChat {
  writerName: string;
  aptId?: number;
  chatName?: string | null;
  writerId: number;
  roomId?: number | null;
  msg?: string;
  regDate: string;
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    chats: [] as Chat[],
  }),
  actions: {
    setChats(newChats: Chat[]) {
      this.chats = newChats.map((chat) => ({
        ...chat,
        isRead: chat.unreadCount ?? 0,
      }));
    },
    addChat(chatMessage: Chat) {
      const newChat: Chat = {
        id: chatMessage.id,
        writerName: chatMessage.writerName,
        writerId: chatMessage.writerId,
        roomId: chatMessage.roomId,
        msg: chatMessage.msg,
        type: chatMessage.type,
        unreadCount: chatMessage.unreadCount,
        createdDate: String(new Date(chatMessage.createdDate)),
      };
      this.chats.push(newChat);
    },
    addChatLeaveText(chatMessage: Chat) {
      const newChat: Chat = {
        id: chatMessage.id,
        writerName: chatMessage.writerName,
        writerId: chatMessage.writerId,
        roomId: chatMessage.roomId,
        msg: chatMessage.msg,
        type: chatMessage.type,
        delete: false,
        unreadCount: chatMessage.unreadCount,
        createdDate: String(new Date(chatMessage.createdDate)),
      };
      this.chats.push(newChat);
    },
    addChatInviteText(chatMessage: Chat) {
      const newChat: Chat = {
        id: chatMessage.id,
        writerName: chatMessage.writerName,
        writerId: chatMessage.writerId,
        roomId: chatMessage.roomId,
        msg: chatMessage.msg,
        type: chatMessage.type,
        beforeMsgId: chatMessage.beforeMsgId,
        createdDate: String(new Date(chatMessage.createdDate)),
      };
      this.chats.push(newChat);
    },
  },
});
