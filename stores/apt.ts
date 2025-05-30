import { defineStore } from "pinia";

interface APT {
  id: number;
  name: string;
}

export interface APTDetail {
  id: number;
  name: string;
  userId: number;
}

export const useAPTListStore = defineStore("aptlist", {
  state: () => ({
    aptList: [] as APT[],
    aptDetail: {} as APT,
  }),
  actions: {
    setAPTList(newAPTList: APT[]) {
      this.aptList = newAPTList;
    },
    setAPTDetail(newApt: APTDetail) {
      this.aptDetail = newApt;
    },
  },
});
