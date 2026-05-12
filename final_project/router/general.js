const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();
const axios = require('axios');

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

// Task 10: Get all books using Axios async/await
public_users.get("/async/books", async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book by ISBN using Axios async/await
public_users.get("/async/isbn/:isbn", async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get('http://localhost:5000/isbn/' + isbn);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 12: Get books by author using Axios async/await
public_users.get("/async/author/:author", async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get('http://localhost:5000/author/' + author);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Task 13: Get books by title using Axios async/await
public_users.get("/async/title/:title", async function (req, res) {
  try {
    const title = req.params.title;
    const response = await axios.get('http://localhost:5000/title/' + encodeURIComponent(title));
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "No books found for this title" });
  }
});

module.exports.general = public_users;
