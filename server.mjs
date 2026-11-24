import express from "express";

const app = express();
app.use(express.static("."));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Website running at http://localhost:${port}`));