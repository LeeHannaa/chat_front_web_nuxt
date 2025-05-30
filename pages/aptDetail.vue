<script setup lang="ts">
import type { APTDetail } from "@/stores/apt";
import { fetchAPTDetailList } from "../api/aptApi";
import { postNoteByNonMember } from "../api/noteApi";
import type { postChat } from "../stores/chat";
import { connectWebSocket, submitChatToSocket } from "../utils/socketService";
import type { ChatInfo, NoteNonMember } from "~/stores/model";

const router = useRouter();
const myId = ref<number | null>(null);
const myName = ref<string | null>(null);
const aptDetail = ref<APTDetail | null>(null);

const route = useRoute();
// 쿼리에서 파라미터 추출
const props_id = Number(route.query.id);
const props_name = String(route.query.name);

async function getAPTDetail() {
  try {
    const data = await fetchAPTDetailList(props_id);
    if (data) {
      console.log("매물 목록:", data);
      aptDetail.value = {
        id: data.id, // 매물 아이디
        name: props_name,
        userId: data.userId,
      };
    }
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  getAPTDetail();
  const storedId = localStorage.getItem("userId");
  const storedName = localStorage.getItem("userName");
  if (storedId) {
    myId.value = Number(storedId);
    myName.value = String(storedName);
    console.log("myId : ", myId.value, storedName);
  }
});

function handleAPTClick() {
  // 매물 문의 채팅 전송
  const newChat: postChat = {
    writerName: myName.value ?? "",
    aptId: props_id,
    chatName: null,
    writerId: myId.value ?? 0,
    roomId: null,
    msg: decodeURIComponent(window.location.href),
    regDate: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
  };
  submitChatToSocket(newChat);

  // TODO : 방 생성이 완료되면 방 ID 또는 완료 신호를 받고 채팅방으로 이동
  if (myId.value) {
    connectWebSocket(myId.value, (parsedMessage) => {
      if (parsedMessage.type === "CLEAR_ROOM") {
        const info = parsedMessage.message as ChatInfo;
        console.log(info);
        // 채팅방으로 이동
        // 받아야 하는 정보 : 방 아이디, 상대방 이름,
        router.push({
          path: "/chat",
          query: {
            id: info.roomId,
            name: info.name,
            // from: 'aptlist',
          },
        });
      }
    });
  }
}

const phoneNumber = ref("");
const noteText = ref("");
async function handleSendNoteClick() {
  const requestData: NoteNonMember = {
    aptId: props_id,
    phoneNumber: phoneNumber.value.trim(),
    noteText: noteText.value.trim(),
    regDate: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
  };
  console.log("전송할 데이터:", requestData);
  const data = await postNoteByNonMember(requestData);
  console.log("쪽지보내기 성공!!:", data);
  if (data.ok) {
    alert("쪽지를 전송했습니다!");
  }
  phoneNumber.value = "";
  noteText.value = "";
}
</script>

<template>
  <main>
    <div class="main">
      <h3>매물 상세 정보 페이지</h3>
      <div class="aptDetail" style="cursor: pointer">
        <h3>{{ aptDetail?.name }}</h3>
        <p style="margin-bottom: 50px">기타 등등의 정보들</p>
        <div v-if="myId != null">
          <button v-if="aptDetail?.userId === myId" class="aptDetailBT">
            매물 수정
          </button>
          <button
            v-else
            class="aptDetailBT"
            @click="aptDetail && handleAPTClick()"
          >
            채팅 문의
          </button>
        </div>
        <div v-else>
          <input
            v-model="phoneNumber"
            inputmode="numeric"
            placeholder="전화번호 입력 (숫자만)"
          />
          <textarea
            v-model="noteText"
            placeholder="문의 내용을 입력하세요"
          ></textarea>
          <button class="aptDetailBT" @click="handleSendNoteClick">
            쪽지 문의
          </button>
        </div>
      </div>
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
.aptDetail {
  margin: 20px;
  width: 200px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.aptDetailBT {
  margin: 5px;
  font-size: 13px;
  width: 70px;
  height: 30px;
  background: #8ec78bff;
  border: none;
  border-radius: 10px;
}
</style>
