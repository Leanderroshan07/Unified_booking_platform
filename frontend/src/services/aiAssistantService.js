import api from "./api";

export const queryAIAssistant = async (message, context = null) => {
  const response = await api.post("/ai-assistant/query", {
    message,
    context,
  });
  return response.data;
};
