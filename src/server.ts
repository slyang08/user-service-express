import dotenv from "dotenv";
import express from "express";

import connectDB from "./config/dbConnect.js";
import router from "./routes/userRoutes";

dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());

// Connect to the database
connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", router);

app.listen(port, () => {
  console.log(`User-service listening on port ${port}`);
});
