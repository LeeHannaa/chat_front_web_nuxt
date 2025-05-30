export const fetchUserInfo = async (myId: number) => {
  try {
    const url = new URL(`http://localhost:8080/user/info?myId=${myId}`);

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
    console.log("유저 정보 : ", data);
    return data; // 응답 데이터를 반환
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};

export const fetchUsers = async () => {
  try {
    const url = new URL(`http://localhost:8080/user/all`);

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
    console.log("유저 정보 : ", data);
    return data; // 응답 데이터를 반환
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};
