import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.js";
import { userRouter } from "./features/user.js";
import { bookRouter } from "./features/book.js";
import { borrowRouter } from "./features/borrow.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/auth", userRouter);
app.use("/api/books", bookRouter);
app.use("/api/borrow", borrowRouter);

app.use(errorHandler);

export default app;
