export const fetchAPTList = async () => {
  try {
    const url = new URL("http://localhost:8080/apt");

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

export const fetchAPTDetailList = async (aptId: number) => {
  try {
    const url = new URL(`http://localhost:8080/apt/detail/${aptId}`);

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
    console.log("매물 상세정보 겟 : ", data);
    return data; // 응답 데이터를 반환
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};
