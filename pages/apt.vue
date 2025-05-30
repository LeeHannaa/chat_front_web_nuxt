<script setup lang="ts">
import { fetchAPTList } from "../api/aptApi";
import { useAPTListStore } from "../stores/apt";

const aptStore = useAPTListStore();
const myId = ref<number | null>(null);

async function getAPTList() {
  try {
    const data = await fetchAPTList();
    if (data) {
      aptStore.aptList = [];
      aptStore.setAPTList(data);
      console.log("매물 목록:", data);
    }
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  getAPTList();
  const storedId = localStorage.getItem("userId");
  if (storedId) {
    myId.value = Number(storedId);
    console.log("myId : ", myId.value);
  }
  if (aptStore.aptList.length > 0) {
    console.log("전역 상태에서 매물 목록 불러옴:", aptStore.aptList);
  }
});
</script>

<template>
  <main>
    <div class="main">
      <h3>매물 리스트</h3>
      <div v-if="aptStore.aptList.length > 0">
        <div
          v-for="apt in aptStore.aptList"
          :key="apt.id"
          class="apt"
          style="cursor: pointer"
        >
          <h3 style="margin: 5px">{{ apt.name }}</h3>
          <NuxtLink
            class="aptBT"
            :to="{ path: '/aptdetail', query: { id: apt.id, name: apt.name } }"
          >
            상세보기
          </NuxtLink>
          <!-- <button class="aptBT" @click="handleAPTClick(apt)">상세보기</button> -->
        </div>
      </div>
      <p v-else>볼 수 있는 매물이 없습니다.</p>
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
.apt {
  background: rgb(232, 255, 228);
  width: 200px;
  height: 100px;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.aptBT {
  all: unset;
  font-size: 12px;
  width: 70px;
  height: 25px;
  background: #8ec78bff;
  border: none;
  border-radius: 10px;
  text-decoration: none;
  cursor: pointer;
  text-align: center;
}
</style>
