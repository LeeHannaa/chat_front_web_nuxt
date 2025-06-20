<script setup lang="ts">
import { useWebSocketStore } from "~/stores/socket";
import { fetchChatList, fetchChatDelete } from "../api/chatlistApi";
import { fetchUserInfo } from "../api/userApi";
import { useChatListStore, type ChatRoom } from "../stores/chatlist";
import { formatDate } from "../utils/formatDate";
import {
  connectWebSocket,
  disconnectWebSocket,
  type WebSocketMessage,
} from "../utils/socketService";

const router = useRouter();
const chatStore = useChatListStore();
const myId = ref<number | null>(null);
const myName = ref<string | null>(null);

const store = useWebSocketStore();
watch(
  () => store.latestMessage,
  (msg: WebSocketMessage | null) => {
    if (!msg) return;
    if (msg.type === "CHATLIST") {
      const chatMessage = msg.message as ChatRoom;
      console.log(chatMessage);

      const index = chatStore.chatList.findIndex(
        (chat: ChatRoom) => chat.roomId === chatMessage.roomId
      );
      if (index !== -1) {
        // 이미 있는 채팅방: 정보 업데이트
        chatStore.updateChatRoom(chatMessage, index);
      } else {
        // 새로운 채팅방 추가
        chatStore.addChatRoom(chatMessage);
      }
      // 시간 기준으로 정렬
      chatStore.sortChatListByLastMsgTime();
    }
  }
);

async function getChatList() {
  if (myId.value === null) return;
  try {
    getUserInfo(); // 이름 로컬에 저장
    const data = await fetchChatList(myId.value); // 임시 myId 넣기
    if (data) {
      chatStore.chatList = [];
      chatStore.setChatList(data);
      chatStore.sortChatListByLastMsgTime();
      console.log("채팅 목록:", data);
    }
  } catch (err) {
    console.error(err);
  }
}

async function getUserInfo() {
  if (myId.value === null) return;
  try {
    const data = await fetchUserInfo(myId.value); // 임시 myId 넣기
    if (data) {
      localStorage.setItem("userName", data.userId);
      myName.value = localStorage.getItem("userName");
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleButtonClick() {
  if (myId.value !== null) {
    await disconnectWebSocket(); // 이름 수정 시 소켓 연결 해제
    connectWebSocket(myId.value);
    getChatList(); // 리스트 가져오기
  } else {
    console.error("사용자 아이디를 입력해 주세요.");
  }
}

onMounted(() => {
  const storedId = localStorage.getItem("userId");
  if (storedId) {
    myId.value = Number(storedId);
    getChatList();
  }
  if (chatStore.chatList.length > 0) {
    console.log("전역 상태에서 채팅 목록 불러옴:", chatStore.chatList);
  }
  watch(myId, (newId: number | null) => {
    if (newId !== null) {
      localStorage.setItem("userId", String(newId));
    } else {
      localStorage.removeItem("userId");
    }
  });
});

onUnmounted(() => {
  // disconnectWebSocket();
});

function handleChatClick(chat: { roomId: number; name: string }) {
  console.log("chat 페이지 넘어가기 전에 확인:!!!!! : ", chat.name);
  router.push({
    path: "/chat",
    query: {
      id: Number(chat.roomId),
      name: chat.name,
      // from: 'chatlist',
    },
  });
}

async function handleDeleteClick(
  roomId: number,
  event: { stopPropagation: () => void }
) {
  event.stopPropagation();
  try {
    await fetchChatDelete(roomId, myId.value!);
    console.log("삭제 완료!!");
    getChatList();
  } catch (err) {
    console.error(err);
  }
}
</script>

<template>
  <main>
    <div class="main">
      <h3>나의 채팅 목록</h3>
      <h5>테스트 사용자 아이디 지정</h5>
      <div>
        <input
          v-model.number="myId"
          placeholder="아이디 입력"
          @keyup.enter="handleButtonClick"
        />
        <button style="margin-left: 10px" @click="handleButtonClick">
          확인
        </button>
      </div>
      <div v-if="chatStore.chatList && chatStore.chatList.length > 0">
        <div
          v-for="chat in chatStore.chatList"
          :key="chat.roomId"
          class="chat"
          style="cursor: pointer"
          @click="handleChatClick(chat)"
        >
          <div style="display: flex">
            <h3 style="margin: 0">[ {{ chat.name }} ] 채팅방</h3>
            <div
              v-if="chat.unreadCount && chat.unreadCount > 0"
              class="unreadBox"
            >
              {{ chat.unreadCount }}
            </div>
          </div>

          <p>{{ chat.lastMsg || "메시지가 없습니다" }}</p>
          <p style="font-size: 8px; margin-left: 70%">
            {{
              chat.updateLastMsgTime
                ? formatDate(chat.updateLastMsgTime.toString())
                : ""
            }}
          </p>
          <button
            class="deleteBT"
            @click="handleDeleteClick(chat.roomId, $event)"
          >
            나가기
          </button>
        </div>
      </div>
      <p v-else>채팅 목록이 없습니다.</p>
    </div>
  </main>
</template>

<style>
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.chat {
  background: rgb(232, 255, 228);
  width: 300px;
  height: 150px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
p {
  margin: 0;
}
.deleteBT {
  margin: 5px;
  font-size: 13px;
  width: 70px;
  height: 30px;
  background: #8ec78bff;
  border: none;
  border-radius: 10px;
}
.unreadBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: red;
  color: white;
  border-radius: 45%;
  font-size: 12px;
}
</style>
