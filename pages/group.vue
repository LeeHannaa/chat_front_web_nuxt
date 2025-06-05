<script setup lang="ts">
import { fetchUsers } from "../api/userApi";
import { postGroupChatRoomCreate } from "../api/chatApi";
import { useUserListStore } from "../stores/user";
export interface GroupChatRoom {
  userIds: number[];
  chatRoomName: string;
  regDate: string;
}

const userStore = useUserListStore();
const myId = ref<number | null>(null);

async function getUserList() {
  try {
    const data = await fetchUsers();
    if (data) {
      userStore.userList = [];
      userStore.setUserList(data);
      console.log("유저 목록:", data);
    }
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  getUserList();
  const storedId = localStorage.getItem("userId");
  if (storedId) {
    myId.value = Number(storedId);
    console.log("myId : ", myId.value);
  }
  if (userStore.userList.length > 0) {
    console.log("전역 상태에서 매물 목록 불러옴:", userStore.userList);
  }
});

const selectedUserIds = ref<number[]>([]);

function handleGroupClick(userId: number) {
  const index = selectedUserIds.value.indexOf(userId);
  if (index > -1) {
    selectedUserIds.value.splice(index, 1);
  } else {
    selectedUserIds.value.push(userId);
  }
}

const router = useRouter();
const chatRoomName = ref("");

async function handleGroupCreateClick() {
  if (!chatRoomName.value.trim()) {
    alert("채팅방 이름을 입력해주세요.");
    return;
  }

  if (selectedUserIds.value.length === 0) {
    alert("친구를 한 명 이상 선택해주세요.");
    return;
  }
  if (!selectedUserIds.value.includes(myId.value!)) {
    selectedUserIds.value.push(myId.value!);
  }

  const requestData: GroupChatRoom = {
    userIds: selectedUserIds.value,
    chatRoomName: chatRoomName.value.trim(),
    regDate: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
  };
  console.log("전송할 데이터:", requestData);
  const data = await postGroupChatRoomCreate(requestData);
  console.log("새로운 채팅방 생성 데이터:", data);
  // TODO : 여기서부터!!!
  router.push({
    path: "/chat",
    query: {
      id: data.id,
      name: data.name,
      from: "group",
    },
  });
}
</script>

<template>
  <main>
    <div class="main">
      <h3>단체 채팅방 만들기 test</h3>
      <p>친구 등록이 있다는 가정 하에 (현재는 그냥 유저 전원 불러옴)</p>
      <div v-if="userStore.userList.length > 0">
        <div
          v-for="user in userStore.userList"
          :key="user.id"
          class="user"
          style="cursor: pointer"
        >
          <h3>{{ user.name }}</h3>
          <button
            :class="{
              groupBT: true,
              active: selectedUserIds.includes(user.id),
            }"
            @click="handleGroupClick(user.id)"
          >
            선택
          </button>
        </div>
      </div>
      <p v-else>친구가 없습니다.</p>
      <input v-model="chatRoomName" placeholder="채팅방 이름을 입력하세요" />
      <button class="groupCreateBT" @click="handleGroupCreateClick()">
        방 만들기
      </button>
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
.user {
  background: rgb(232, 255, 228);
  width: 180px;
  height: 100px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.groupBT {
  margin: 5px;
  font-size: 13px;
  width: 50px;
  height: 30px;
  background: #8ec78bff;
  border: none;
  border-radius: 10px;
}
.groupBT.active {
  background-color: #3498db;
  color: white;
}

.groupCreateBT {
  margin: 5px;
  font-size: 13px;
  width: 150px;
  height: 50px;
  background: #c9e850ff;
  border: none;
  border-radius: 10px;
}
</style>
