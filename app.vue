<template>
  <header>
    <div class="wrapper">
      <h1>채팅 시스템</h1>
      <nav>
        <NuxtLink to="/">채팅 목록</NuxtLink>
        <NuxtLink to="/apt">매물 리스트</NuxtLink>
        <NuxtLink to="/person">개인 연락 테스트</NuxtLink>
        <NuxtLink to="/group">채팅방 생성 테스트</NuxtLink>
      </nav>
      <NuxtPage />
    </div>
  </header>
</template>
<style scoped>
header {
  line-height: 1.5;
}

nav {
  width: 100%;
  height: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

nav :deep(a.router-link-exact-active) {
  color: hsla(160, 100%, 37%, 1);
  font-weight: bold;
}

nav :deep(a.router-link-exact-active:hover) {
  background-color: transparent;
}

nav :deep(a) {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
}

nav :deep(a:first-of-type) {
  border: 0;
}
h1 {
  font-weight: 500;
  font-size: 1.5rem;
  position: relative;
  text-align: center;
}
</style>
