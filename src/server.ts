import dotenv from "dotenv";
import express from "express";

import router from "./routes/userRoutes";

dotenv.config();
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/users", router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
