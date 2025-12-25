import express from "express";
import logRoutes from "./routes/log.routes";
// import logRoutes from "./routes/log.routes";

const app = express();

app.use(express.json());
// app.use("/api", logRoutes);
app.get("/",(req,res)=>{
    res.status(200).json({
        message:"server is running.."
    });
})
app.use("/api", logRoutes); 

export default app;
