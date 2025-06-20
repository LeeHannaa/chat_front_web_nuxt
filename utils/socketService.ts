import type { Chat, postChat } from "@/stores/chat";
import type { ChatRoom } from "@/stores/chatlist";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { useWebSocketStore } from "@/stores/socket";

export interface WebSocketMessage {
  type: string;
  message: JSON | string | Chat | ChatRoom;
  messageId: string;
  msgToReadCount: number;
}

let websocketClient: Client | null = null;
let subscription: StompSubscription | null = null;
let connected = false;
const subscriptions: Map<string, StompSubscription> = new Map();

// -> 처음 한번 웹소켓 구독 후 해당 구독 경로에 대해서 전달 받은 메시지를 다른 페이지, 컴포넌트에 반영해야함.
export function connectWebSocket(myId: number) {
  const url = "ws://localhost:8080/ws-stomp";

  if (websocketClient && connected) {
    console.log("✅connectWebSocket : 이미 웹소켓 연결되어 있음");
    return;
  }

  websocketClient = new Client({
    brokerURL: url,
    debug: (str) => console.log(str),
    onConnect: () => {
      connected = true;
      createOnConnectHandler(myId)();
      console.log("✅ 웹소켓 연결 완료");
    },
    onDisconnect: () => {
      connected = false;
      subscriptions.delete(`/topic/chat/${myId}`);
      console.log("onDisconnect : 웹소켓 연결 해제됨");
    },
    onStompError: (frame) => {
      console.error("STOMP 에러:", frame);
    },
  });
  websocketClient.activate();
}

function createOnConnectHandler(myId: number) {
  return () => {
    const destination = `/topic/chat/${myId}`;
    if (subscriptions.has(destination)) {
      console.log("createOnConnectHandler : 이미 구독된 경로");
      return;
    }
    if (!websocketClient || !connected) {
      console.log("❌ 웹소켓이 아직 연결되지 않았습니다.");
      return;
    }
    const websocketStore = useWebSocketStore();
    subscription = websocketClient!.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message.body);
          console.log("소켓 연결에서 확인해보기 : ", parsedMessage);
          websocketStore.latestMessage = parsedMessage;
        } catch (error) {
          console.error("웹소켓 기본 구독 경로 메시지 파싱 오류:", error);
        }
      }
    );
    subscriptions.set(destination, subscription);
  };
}

export function submitChatToSocket(newChat: postChat) {
  try {
    if (!websocketClient || !connected) {
      console.warn("❌ 웹소켓이 아직 연결되지 않았습니다.");
      return;
    }
    websocketClient!.publish({
      destination: "/app/message",
      body: JSON.stringify(newChat),
    });
  } catch (e) {
    console.log("채팅 전송 실패 : ", e);
  }
}

export function submitChatToIncome(userId: number, roomId: number) {
  try {
    websocketClient!.publish({
      destination: `/app/chat/income`,
      body: JSON.stringify({ roomId: roomId, userId: userId }),
    });
  } catch (e) {
    console.log("채팅 전송 실패 : ", e);
  }
}

export function submitChatToLeave(userId: number, roomId: number) {
  try {
    websocketClient!.publish({
      destination: `/app/chat/leave`,
      body: JSON.stringify({ roomId: roomId, userId: userId }),
    });
  } catch (e) {
    console.log("채팅 전송 실패 : ", e);
  }
}

export async function disconnectWebSocket() {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }

  if (websocketClient?.connected || websocketClient?.active) {
    await websocketClient.deactivate();
    websocketClient = null;
    console.log("disconnectWebSocket : 웹소켓 연결 종료");
  }
}
