import { defineStore } from "pinia";

interface User {
  id: number;
  name: string;
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
