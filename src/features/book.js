import express from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  ISBN: String,
  publicationDate: Date,
  genre: String,
  copies: Number
});

const Book = mongoose.model("Book", bookSchema);

// Add book (Admin)
router.post("/", auth("ADMIN"), async (req, res) => {
  const book = await Book.create(req.body);
  res.json(book);
});

// Update book
router.patch("/:id", auth("ADMIN"), async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(book);
});

// Delete book
router.delete("/:id", auth("ADMIN"), async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Book deleted" });
});

// List books (all users)
router.get("/", async (req, res) => {
  const { page = 1, limit = 10, genre, author, q } = req.query;
  const filter = {};
  if (genre) filter.genre = genre;
  if (author) filter.author = author;
  if (q) filter.title = new RegExp(q, "i");

  const books = await Book.find(filter)
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(books);
});

export { router as bookRouter, Book };
