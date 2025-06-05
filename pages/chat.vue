<script setup lang="ts">
import {
  deleteChatMessageToAll,
  fetchChats,
  fetchUnreadCountByRoom,
  postInviteUserInGroupChat,
} from "../api/chatApi";
// Store
import { useChatStore, type Chat, type postChat } from "@/stores/chat";
// Utils
import { formatDate } from "~/utils/formatDate";
import {
  createOnConnectByChatHandler,
  submitChatToSocket,
  unsubscribeFromChatRoom,
} from "~/utils/socketService";

// 쿼리에서 파라미터 추출
const route = useRoute();
const props_id = Number(route.query.id);
const props_name = String(route.query.name);
const props_from = String(route.query.from);

// const subscription: StompSubscription | null = null
let unreadCountByMe: number;

const chatStore = useChatStore();
const myId = ref<number | null>(null);
const myName = ref<string | null>(null);
const roomId = ref<number | null>(null);
const msg = ref<string | null>(null);
const chatContainer = ref<HTMLElement | null>(null);
const hiddenBtId = ref<string[]>([]);
let isGroup = false;

function moveScroll() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}

async function getChats() {
  if (myId.value === null) {
    console.error("사용자 ID가 없습니다.");
    return;
  }
  if (props_from == "group") {
    roomId.value = props_id;
    isGroup = props_from === "group";
    connect(); // 웹소켓 연결
  } else {
    try {
      const data = await fetchChats(myId.value, props_id);
      console.log("채팅 내역 받아온 데이터 확인 : ", data);
      if (data) {
        if (data[0] && data[0].id) {
          // 기존에 존재하던 대화방
          chatStore.setChats(data || []);
          roomId.value = data[0]?.roomId;
          console.log(
            "채팅방 아이디 : ",
            roomId.value,
            "\n 채팅 내역:",
            chatStore.chats
          );
          moveScroll();
        } else {
          // 방이 새로 만들어진 경우에는 setChats를 하지 않음
          roomId.value = data[0]?.roomId || null;
          console.log("처음 방 생성!! 방 아이디 : ", roomId);
        }
        connect(); // 웹소켓 연결
        unreadCountByMe = await fetchUnreadCountByRoom(
          roomId?.value ?? 0,
          myId?.value ?? 0
        );

        const safeUnreadCount = unreadCountByMe ?? 0;
        const start = Math.max(chatStore.chats.length - safeUnreadCount, 0);
        for (let i = chatStore.chats.length - 1; i >= start; i--) {
          if (chatStore.chats[i] && chatStore.chats[i].type == "TEXT") {
            chatStore.chats[i].unreadCount =
              (chatStore.chats[i].unreadCount ?? 1) - 1;
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}
onMounted(() => {
  myId.value = Number(localStorage.getItem("userId"));
  myName.value = localStorage.getItem("userName");
  console.log("myId : ", myId.value);
  chatStore.chats = [];
  getChats();
});

// TODO : socketService에 함수 사용해서 소켓 구독 경로 추가하는 로직으로 변경
function connect() {
  const subscribeToChat = createOnConnectByChatHandler(
    roomId.value!,
    myId.value!,
    (parsedMessage) => {
      console.log("채팅방 웹소켓 연결 성공!!!!!!!!!!!!!!");
      if (parsedMessage.type === "CHAT") {
        console.log("💬 채팅 메시지 수신:", parsedMessage);
        const chat = parsedMessage.message as Chat;
        chatStore.addChat(chat);
        moveScroll();
      } else if (parsedMessage.type === "INFO") {
        console.log(
          "🟢 상대방 입장!, 읽음처리해야할 메시지 개수 : ",
          parsedMessage.message
        );
        // 상대방 입장 시 상대가 해당 채팅방에서 읽지 않았던 메시지 개수만큼 정보 전달! 그거보고 unreadCount 감소처리
        // 여기서 필요한 처리 (예: 읽음 처리, UI 변경 등)
        const changeNumber = parseInt(parsedMessage.message as string);
        for (
          let i = chatStore.chats.length - 1;
          i > Math.max(0, chatStore.chats.length - changeNumber - 1);
          i--
        ) {
          if (chatStore.chats[i].type == "TEXT") {
            if (chatStore.chats[i].unreadCount == 0) break;
            chatStore.chats[i].unreadCount =
              (chatStore.chats[i].unreadCount ?? 1) - 1;
          }
        }
      } else if (parsedMessage.type === "OUT") {
        if (parsedMessage.message === "상대방 퇴장") {
          console.log("🟢 상대방 퇴장!!!!!!!");
        }
      } else if (parsedMessage.type === "DELETE") {
        const msgId = parsedMessage.messageId;
        console.log("🗑️ 해당 메시지 삭제!! : ", msgId);
        const index = chatStore.chats.findIndex(
          (chat: Chat) => chat.id === msgId
        );
        if (index !== -1) {
          chatStore.chats.splice(index, 1);
          chatStore.chats = [...chatStore.chats];
        }
      } else if (parsedMessage.type === "LEAVE") {
        const message = parsedMessage.message as Chat;
        const changeNumber = parsedMessage.msgToReadCount;
        console.log(
          "🗑️ 해당 유저 나감!! : ",
          parsedMessage.message,
          "읽음처리 수 : ",
          changeNumber
        );
        for (
          let i = chatStore.chats.length - 1;
          i > Math.max(0, chatStore.chats.length - changeNumber - 1);
          i--
        ) {
          if (chatStore.chats[i].type == "TEXT") {
            if (chatStore.chats[i].unreadCount == 0) break;
            chatStore.chats[i].unreadCount =
              (chatStore.chats[i].unreadCount ?? 1) - 1;
          }
        }
        chatStore.addChatLeaveText(message);
        moveScroll();
      } else if (parsedMessage.type === "INVITE") {
        const chatMessage = parsedMessage.message as Chat;
        console.log("해당 유저 들어옴!! : ", chatMessage);
        chatStore.addChatInviteText(chatMessage);
        // 초대 메시지를 상대가 눌렀다면 나의 ui에서도 안보이게 해주기
        if (!hiddenBtId.value.includes(chatMessage.beforeMsgId!)) {
          hiddenBtId.value.push(chatMessage.beforeMsgId!);
        }
        moveScroll();
      } else {
        console.log("⚠️ 알 수 없는 메시지 타입:", parsedMessage.type);
      }
    }
  );
  subscribeToChat();
}
onUnmounted(() => {
  if (roomId.value && myId.value)
    unsubscribeFromChatRoom(roomId.value, myId.value);
});

function handleButtonClick() {
  // console.log('메시지 보내기 전 사용자 이름 확인 : ', myName.value)
  if (msg.value && msg.value.trim() !== "") {
    const newChat: postChat = {
      writerName: myName.value ?? "",
      chatName: props_name ?? "",
      writerId: myId.value ?? 0,
      roomId: roomId.value ?? 0,
      msg: msg.value.trim(),
      regDate: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
    };
    submitChatToSocket(newChat);
    // 메시지 입력칸 초기화
    msg.value = null;
  } else {
    console.log("빈 메시지는 전송할 수 없습니다.");
  }
}

async function deleteMessageToAll(msgId: string) {
  await deleteChatMessageToAll(msgId, myId.value!);
  const index = chatStore.chats.findIndex((chat: Chat) => chat.id === msgId);
  if (index !== -1) {
    // chatStore.chats[index].msg = '삭제된 메시지입니다.'
    // chatStore.chats[index].delete = true;
    chatStore.chats.splice(index, 1);
  }
}

async function clickInviteUser(userId: number, msgId: string) {
  hiddenBtId.value.push(msgId);
  await postInviteUserInGroupChat(userId, roomId.value ?? 0, msgId);
}

function changeToUrl(text?: string): string {
  if (!text) return "";
  const urlRegex = /((https?:\/\/)[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${url}</a>`;
  });
}
</script>

<template>
  <div class="chatpage">
    <h2>[ {{ props_name }} ] 대화방</h2>
    <div
      v-if="chatStore.chats.length > 0 && myId !== null"
      ref="chatContainer"
      class="chatBox"
    >
      <div
        v-for="chat in chatStore.chats"
        :key="chat.id"
        :class="{
          'my-chat': chat.type !== 'SYSTEM' && chat.writerId === myId,
          'other-chat': chat.type !== 'SYSTEM' && chat.writerId !== myId,
          'system-chat': chat.type === 'SYSTEM',
        }"
      >
        <div v-if="chat.type === 'TEXT'" class="chat-content">
          <h3 v-if="chat.writerId !== myId">{{ chat.writerName }}</h3>
          <p class="msg-text" v-html="changeToUrl(chat.msg ?? '')"></p>
          <p class="date-text">{{ formatDate(chat.createdDate) }}</p>
          <div>
            <span class="isread">{{
              chat?.unreadCount && chat.unreadCount > 0 ? chat.unreadCount : ""
            }}</span>
            <button
              v-if="chat.writerId === myId && !chat.delete"
              class="deleteBT"
              @click="deleteMessageToAll(chat.id)"
            >
              삭제
            </button>
          </div>
        </div>
        <div v-else-if="chat.type === 'SYSTEM'" class="chat-content">
          <template v-if="!chat.msg?.includes('초대')">
            <p>{{ chat.msg }}</p>
            <button
              v-if="!chat.delete && !hiddenBtId.includes(chat.id)"
              class="invite-button"
              @click="clickInviteUser(chat.writerId, chat.id)"
            >
              다시 초대하기
            </button>
          </template>
          <template v-else>
            <p>{{ chat.msg }}</p>
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="
        props_from == 'person' ||
        isGroup ||
        (chatStore.chats.length > 0 && chatStore.chats[0].writerId != null)
      "
      class="inputBox"
    >
      <input
        v-model="msg"
        class="msginput"
        placeholder="메시지를 입력하세요"
        @keyup.enter="handleButtonClick"
      />
      <button
        class="msgBT"
        style="margin-left: 10px"
        @click="handleButtonClick"
      >
        확인
      </button>
    </div>
  </div>
</template>

<style>
.chatpage {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f9f9f9;
  padding: 15px;
  position: relative;
  height: 70vh;
}

.chatBox {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 80%;
  overflow: auto;
}

.my-chat {
  align-self: flex-end;
  background-color: #d3f9d8;
  padding: 12px;
  border-radius: 10px;
  margin-right: 10px;
  max-width: 50%;
  margin-bottom: 12px;
}

.other-chat {
  align-self: flex-start;
  background-color: #e1f0f9;
  padding: 12px;
  border-radius: 10px;
  margin-left: 10px;
  max-width: 50%;
  margin-bottom: 12px;
}

.system-chat {
  text-align: center;
  color: #856404;
  font-size: 13px;
  margin-bottom: 10px;
  padding: 10px;
  padding-bottom: 2px;
}

.chat-content h3 {
  margin: 0;
  font-weight: bold;
}

.inputBox {
  width: 100%;
  position: absolute;
  bottom: 0;
  margin-left: 8%;
  margin-bottom: 20px;
  align-items: center;
}

.msginput {
  margin: 5px;
  font-size: 13px;
  width: 80%;
  height: 40px;
  border-radius: 10px;
  border: none;
  box-shadow: 4px 4px 6px rgba(139, 191, 102, 0.1);
  padding: 10px;
}

.msgBT {
  margin: 5px;
  font-size: 13px;
  width: 10%;
  height: 40px;
  background: #8ec78bff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.invite-button {
  font-size: 11px;
  color: #b68904;
  background: none;
  border: none;
  cursor: pointer;
}

.deleteBT {
  margin: 1px;
  font-size: 8px;
  height: 20px;
  max-width: 50px;
  background: #c2b65dff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.isread {
  font-size: 8px;
  color: gray;
}
.msg-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
}

.date-text {
  margin: 0;
  font-size: 8px;
  color: gray;
}
</style>
