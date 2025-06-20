import { defineStore } from "pinia";
import { ref } from "vue";
import type { WebSocketMessage } from "../utils/socketService";

export const useWebSocketStore = defineStore("websocket", () => {
  const latestMessage = ref<WebSocketMessage | null>(null);

  return {
    latestMessage,
  };
});
