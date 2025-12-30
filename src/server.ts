import app, { connectProducer } from "./app";

const PORT = 5000;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port http://localhost:${PORT}`);
// });
async function start() {
  await connectProducer();
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}

start();