import express from "express";
import logs from "./ingestion/ingestion.routes";

const app = express();

app.use(express.json());
// app.use("/api", logRoutes);
app.get("/",(req,res)=>{
    res.status(200).json({
        message:"server is running.."
    });
})
app.use("/log", logs); 

export default app;
