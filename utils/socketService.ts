import type { Chat, postChat } from "@/stores/chat";
import type { ChatRoom } from "@/stores/chatlist";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";

export interface WebSocketMessage {
  type: string;
  message: ChatRoom;
}

export interface WebSocketMessageChat {
  type: string;
  message: JSON | string | Chat;
  messageId: string;
  msgToReadCount: number;
}

let websocketClient: Client | null = null;
let subscription: StompSubscription | null = null;
const subscriptions: Map<string, StompSubscription> = new Map();

export function connectWebSocket(
  myId: number,
  onMessage: (parsedMessage: WebSocketMessage) => void
) {
  const url = "ws://localhost:8080/ws-stomp";

  websocketClient = new Client({
    brokerURL: url,
    debug: (str) => console.log(str),
    onConnect: createOnConnectHandler(myId, onMessage), // 기본 구독 경로
    onStompError: (frame) => {
      console.error("STOMP 에러:", frame);
    },
  });
  websocketClient.activate();
}

function createOnConnectHandler(
  myId: number,
  onMessage: (parsedMessage: WebSocketMessage) => void
) {
  return () => {
    const destination = `/topic/user/${myId}`;
    subscription = websocketClient!.subscribe(
      destination,
      (message: IMessage) => {
        try {
          const parsedMessage: WebSocketMessage = JSON.parse(message.body);
          onMessage(parsedMessage);
        } catch (error) {
          console.error("웹소켓 기본 구독 경로 메시지 파싱 오류:", error);
        }
      }
    );
    subscriptions.set(destination, subscription);
  };
}

// 채팅방 구독 경로
export function createOnConnectByChatHandler(
  roomId: number,
  myId: number,
  onMessage: (parsedMessage: WebSocketMessageChat) => void
) {
  return () => {
    const destination = `/topic/chatroom/${roomId}`;
    const subscriptionId = `chatroom-${roomId}-user-${myId}`;
    subscription = websocketClient!.subscribe(
      destination,
      (message) => {
        try {
          const parsedMessage = JSON.parse(
            message.body
          ) as WebSocketMessageChat;
          onMessage(parsedMessage);
        } catch (error) {
          console.error("웹소켓 채팅방 구독 경로 메시지 파싱 오류:", error);
        }
      },
      {
        id: subscriptionId,
        // myId: String(myId), // 헤더에 myId 추가
      }
    );
    subscriptions.set(subscriptionId, subscription);
  };
}

/// 채팅방 구독 취소
export function unsubscribeFromChatRoom(roomId: number, myId: number) {
  const subscriptionId = `chatroom-${roomId}-user-${myId}`;
  if (subscriptions.has(subscriptionId)) {
    const sub = subscriptions.get(subscriptionId);
    console.log("구독 취소할 때 sub 확인 : ", sub);
    sub?.unsubscribe(); // 서버로 UNSUBSCRIBE 전송됨
    subscriptions.delete(subscriptionId);
    console.log(`❌ Unsubscribed from ${subscriptionId}`);
  }
}

export function submitChatToSocket(newChat: postChat) {
  try {
    websocketClient!.publish({
      destination: "/app/message",
      body: JSON.stringify(newChat),
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
    console.log("웹소켓 연결 종료");
  }
}
