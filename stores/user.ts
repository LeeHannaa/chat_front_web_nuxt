import { defineStore } from "pinia";

interface User {
  userIdx: number;
  userId: string;
}

export const useUserListStore = defineStore("userList", {
  state: () => ({
    userList: [] as User[],
  }),
  actions: {
    setUserList(newUserList: User[]) {
      this.userList = newUserList;
    },
  },
});
