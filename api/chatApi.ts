import type { GroupChatRoom } from "@/pages/group.vue";

export const fetchChats = async function fetchData(myId: number, id: number) {
  let apiUrl = "";

  console.log("chatlist에서 옴!!!");
  apiUrl = `http://localhost:8080/chatmsg/find/list/${id}?myId=${myId}`; // 채팅방 아이디

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data; // 응답 데이터를 반환
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const fetchUnreadCountByRoom = async function fetchData(
  roomId: number,
  myId: number
) {
  const apiUrl = `http://localhost:8080/chat/unread/count/${roomId}?myId=${myId}`;

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("방입장 시 상대가 읽지않은 메시지 수 : ", data);
    return data; // 응답 데이터를 반환
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const deleteChatMessageToMe = async (msgId: string, myId: number) => {
  try {
    const url = new URL(
      `http://localhost:8080/chatmsg/delete/me/${msgId}?myId=${myId}`
    );

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const deleteChatMessageToAll = async (msgId: number, myId: number) => {
  try {
    const url = new URL(
      `http://localhost:8080/chatmsg/delete/all/${msgId}?myId=${myId}`
    );

    const response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const postGroupChatRoomCreate = async function fetchData(
  groupChatRoom: GroupChatRoom
) {
  const apiUrl = `http://localhost:8080/chat/create/group`;

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupChatRoom),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const fetchConnectUserChat = async function fetchData(
  userId: number,
  myId: number
) {
  const apiUrl = `http://localhost:8080/chat/connect/${userId}?myId=${myId}`;

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("방입장 시 상대가 읽지않은 메시지 수 : ", data);
    return data; // 응답 데이터를 반환
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const postInviteUserInGroupChat = async function fetchData(
  userId: number,
  roomId: number,
  msgId: number
) {
  const apiUrl = `http://localhost:8080/chat/invite/user/group`;
  console.log("초대하기 전에 전달할 데이터 확인 : ", userId, +", " + roomId);
  try {
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        roomId: roomId,
        msgId: msgId,
      }),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};
