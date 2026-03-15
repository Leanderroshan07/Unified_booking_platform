const axios = require("axios");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YjUwMjVkNWE3MGYyNThlYWMxYzIxZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzczNDcwMzA5LCJleHAiOjE3NzM1NTY3MDl9.vYytGjpVa1AHkGcAIfViYwpfwsaBVOxo2CAGEZXcWqU";

axios.post("http://localhost:5000/api/ai-assistant/query", {
  message: "I want to go to Mumbai and have fun there"
}, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  timeout: 30000
})
.then(response => {
  console.log("AI_ENDPOINT_SUCCESS");
  console.log("Reply:", response.data.reply);
  console.log("Recommendations count:", response.data.recommendations.length);
  console.log("Planner steps:", response.data.plannerSteps.length);
  console.log("Map markers:", response.data.mapMarkers.length);
  console.log("Detected context:", response.data.detectedContext);
})
.catch(error => {
  console.log("AI_ENDPOINT_ERROR");
  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Message:", error.response.data.message || error.response.data.error);
  } else {
    console.log("Error:", error.message);
  }
});
