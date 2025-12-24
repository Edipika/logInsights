import express from "express";
// import logRoutes from "./routes/log.routes";

const app = express();

app.use(express.json());
// app.use("/api", logRoutes);

export default app;
