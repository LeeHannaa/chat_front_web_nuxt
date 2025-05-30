<script setup lang="ts">
import { fetchUsers } from "../api/userApi";
import { fetchConnectUserChat } from "../api/chatApi";
import { useUserListStore } from "../stores/user";

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

const router = useRouter();

async function handleConnectUserClick(userId: number, userName: string) {
  const data = await fetchConnectUserChat(userId, myId.value!); // roomId 전달받기
  console.log("개인 연락 : ", data);
  // TODO : 여기서부터!!!
  router.push({
    path: "/chat",
    query: {
      id: data,
      name: userName,
      // from: 'person',
    },
  });
}
</script>

<template>
  <main>
    <div class="main">
      <h3>직접 유저와 연락하기 test</h3>
      <div v-if="userStore.userList.length > 0">
        <div
          v-for="user in userStore.userList"
          :key="user.id"
          class="user"
          style="cursor: pointer"
        >
          <h3>{{ user.name }}</h3>
          <button
            class="personBT"
            @click="handleConnectUserClick(user.id, user.name)"
          >
            연락
          </button>
        </div>
      </div>
      <p v-else>친구가 없습니다.</p>
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

.personBT {
  margin: 5px;
  font-size: 13px;
  width: 50px;
  height: 30px;
  background: #8ec78bff;
  border: none;
  border-radius: 10px;
}
</style>
