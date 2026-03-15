const axios = require("axios");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YjUwMjVkNWE3MGYyNThlYWMxYzIxZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzczNDcwMzA5LCJleHAiOjE3NzM1NTY3MDl9.vYytGjpVa1AHkGcAIfViYwpfwsaBVOxo2CAGEZXcWqU";

// Better structured message
const message = "I'm in Mumbai and want to watch a movie or have some fun this evening";

axios.post("http://localhost:5000/api/ai-assistant/query", {
  message
}, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  timeout: 35000
})
.then(response => {
  const data = response.data;
  console.log("\n✅ AI_ENDPOINT_WORKING\n");
  console.log("📝 Reply:", data.reply);
  console.log("\n📊 Results:");
  console.log("  - Recommendations found:", data.recommendations.length);
  console.log("  - Map markers:", data.mapMarkers.length);
  console.log("  - Planner steps:", data.plannerSteps.length);
  console.log("\n🎯 Detected Context:");
  console.log("  - Location:", data.detectedContext.location);
  console.log("  - Intent:", data.detectedContext.intent);
  console.log("\n📋 Planner Steps:");
  data.plannerSteps.forEach((step, i) => console.log(`  ${i+1}. ${step}`));
  if (data.recommendations.length > 0) {
    console.log("\n🏆 Top Recommendations:");
    data.recommendations.slice(0, 3).forEach((rec, i) => {
      console.log(`  ${i+1}. ${rec.name} (${rec._type}) - Score: ${rec.score}`);
    });
  }
})
.catch(error => {
  console.log("\n❌ AI_ENDPOINT_ERROR");
  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Data:", error.response.data);
  } else {
    console.log("Error:", error.message);
  }
});
