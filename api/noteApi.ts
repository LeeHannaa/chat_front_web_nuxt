import type { NoteNonMember } from "@/pages/aptDetail.vue";

export const postNoteByNonMember = async function fetchData(
  noteNonMember: NoteNonMember
) {
  const apiUrl = `http://localhost:8080/chatmsg/send/guest`;

  try {
    const response = await fetch(apiUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteNonMember),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response;
  } catch (error) {
    console.error("API 요청 실패:", error);
    throw error; // 에러를 상위 함수로 전달
  }
};
