import { defineStore } from "pinia";

interface APT {
  idx: number;
  aptName: string;
}

export interface APTDetail {
  idx: number;
  aptName: string;
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
