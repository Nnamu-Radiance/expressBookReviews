const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password are required" });
  if (isValid(username)) return res.status(409).json({ message: "Username already exists" });
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

public_users.get("/", function (req, res) {
  return res.status(200).json(JSON.stringify(books));
});

public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) return res.status(200).json(books[isbn]);
  return res.status(404).json({ message: "Book not found" });
});

public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const matches = Object.keys(books)
    .filter(k => books[k].author.toLowerCase() === author.toLowerCase())
    .map(k => books[k]);
  if (matches.length > 0) return res.status(200).json(matches);
  return res.status(404).json({ message: "No books found for this author" });
});

public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const matches = Object.keys(books)
    .filter(k => books[k].title.toLowerCase() === title.toLowerCase())
    .map(k => books[k]);
  if (matches.length > 0) return res.status(200).json(matches);
  return res.status(404).json({ message: "No books found for this title" });
});

public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) return res.status(200).json(books[isbn].reviews);
  return res.status(404).json({ message: "Book not found" });
});

public_users.get("/async/books", async function (req, res) {
  try {
    const result = await new Promise((resolve) => resolve(books));
    return res.status(200).json(JSON.stringify(result));
  } catch (err) { return res.status(500).json({ message: "Error" }); }
});

public_users.get("/async/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const result = await new Promise((resolve, reject) => {
      if (books[isbn]) resolve(books[isbn]); else reject("Book not found");
    });
    return res.status(200).json(result);
  } catch (err) { return res.status(404).json({ message: err }); }
});

public_users.get("/async/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const result = await new Promise((resolve, reject) => {
      const matches = Object.keys(books)
        .filter(k => books[k].author.toLowerCase() === author.toLowerCase())
        .map(k => books[k]);
      if (matches.length > 0) resolve(matches); else reject("No books found");
    });
    return res.status(200).json(result);
  } catch (err) { return res.status(404).json({ message: err }); }
});

public_users.get("/async/title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const result = await new Promise((resolve, reject) => {
      const matches = Object.keys(books)
        .filter(k => books[k].title.toLowerCase() === title.toLowerCase())
        .map(k => books[k]);
      if (matches.length > 0) resolve(matches); else reject("No books found");
    });
    return res.status(200).json(result);
  } catch (err) { return res.status(404).json({ message: err }); }
});

module.exports.general = public_users;
