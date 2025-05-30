export const fetchChatList = async (myId: number) => {
  try {
    const url = new URL(`http://localhost:8080/chat?myId=${myId}`);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data; // 응답 데이터를 반환
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const fetchChatDelete = async (roomId: number, myId: number) => {
  try {
    const url = new URL(
      `http://localhost:8080/chat/delete/${roomId}?myId=${myId}`
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
