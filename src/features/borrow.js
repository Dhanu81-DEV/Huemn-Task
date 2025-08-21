import express from "express";
import mongoose from "mongoose";
import { auth } from "../middleware/auth.js";
import { Book } from "./book.js";
import { User } from "./user.js";

const router = express.Router();

// Borrow schema
const borrowSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  borrowedAt: { type: Date, default: Date.now },
  returnedAt: Date
});

const Borrow = mongoose.model("Borrow", borrowSchema);

// ----------------------
// 📌 Borrow a book
// ----------------------
router.post("/", auth("MEMBER"), async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);

    if (!book || book.copies <= 0) {
      return res.status(400).json({ error: "Book not available" });
    }

    // Decrease available copies
    book.copies -= 1;
    await book.save();

    const borrow = await Borrow.create({ user: req.user.id, book: bookId });
    res.json(borrow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// 📌 Return a book
// ----------------------
router.post("/return", auth("MEMBER"), async (req, res) => {
  try {
    const { borrowId } = req.body;
    const borrow = await Borrow.findById(borrowId).populate("book");

    if (!borrow || borrow.returnedAt) {
      return res.status(400).json({ error: "Invalid borrow record" });
    }

    // Mark as returned
    borrow.returnedAt = new Date();
    await borrow.save();

    // Increase available copies
    borrow.book.copies += 1;
    await borrow.book.save();

    res.json({ message: "Returned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// 📌 Borrow history (user-specific)
// ----------------------
router.get("/history", auth("MEMBER"), async (req, res) => {
  try {
    const history = await Borrow.find({ user: req.user.id })
      .populate("book", "title author genre")
      .lean();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// 📊 Reports (Admin only)
// ----------------------

// Most Borrowed Books
router.get("/reports/most-borrowed", auth("ADMIN"), async (req, res) => {
  try {
    const report = await Borrow.aggregate([
      { $group: { _id: "$book", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      {
        $project: {
          _id: 0,
          title: "$book.title",
          author: "$book.author",
          count: 1
        }
      }
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Most Active Members
router.get("/reports/active-members", auth("ADMIN"), async (req, res) => {
  try {
    const report = await Borrow.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          name: "$user.name",
          email: "$user.email",
          count: 1
        }
      }
    ]);

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Availability Report
router.get("/reports/availability", auth("ADMIN"), async (req, res) => {
  try {
    // Total copies of all books
    const books = await Book.find({}, "copies");
    const totalCopies = books.reduce((sum, b) => sum + b.copies, 0);

    // Count active borrows (not returned yet)
    const borrowedCount = await Borrow.countDocuments({ returnedAt: null });

    res.json({
      totalCopies,
      borrowedCount,
      available: totalCopies - borrowedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { router as borrowRouter };
