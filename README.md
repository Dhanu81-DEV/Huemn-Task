# Nalanda - Library Management System (Backend)

* Nalanda is a “Node.js + Express + MongoDB” backend for managing library operations.  
* It supports “JWT authentication”, “role-based access control (Admin / Member)”, and provides APIs for ”user management, book management, borrowing/returning books, and generating reports”. Postman collection is included for easy testing.
# Project Structure
```
nalanda/
├─ package.json
├─ .env.example
├─ README.md
└─ src/
├─ server.js # Server entry point
├─ app.js # Express app
├─ db.js # MongoDB connection
├─ config.js # Config loader
├─ utils/
│ ├─ jwt.js # JWT helper functions
├─ middleware/
│ ├─ auth.js # Auth & role middleware
│ └─ error.js # Error handler
├─ features/
│ ├─ user.js # User routes & controller
│ ├─ book.js # Book routes & controller
│ └─ borrow.js # Borrow/return routes
└─ graphql/
└─ index.js # GraphQL types & resolvers
```
# REST API Endpoints

* All ‘protected routes’ require an "Authorization header":  

```bash Authorization: Bearer <token>```

## 1. Auth

* Register
``` 
POST /api/auth/register
```
``` bash
{
"name": "name",
"email": "name@example.com",
"password": "pass123",
"role": "MEMBER"
}
```

* Login

```
POST /api/auth/login
```
```bash
{
"email": "name@example.com",
"password": "pass123"
}
```

---

## 2. Books
- Add book (Admin only)
```
POST /api/books
```
```bash
{
"title": "The Hobbit",
"author": "Tolkien",
"copies": 5
}
```

- Get all books
```
GET /api/books
```

- Update book (Admin only)
```
PATCH /api/books/:id
```
```bash
{
"copies": 10
}
```
- Delete book (Admin only)
```
DELETE /api/books/:id
```
---

## 3. Borrowing
- Borrow a book
```
POST /api/borrow
```
```bash
{
"bookId": "<BOOK_ID>"
}
```
- Return a book
```
POST /api/borrow/return
```
```bash
{
"bookId": "<BOOK_ID>"
}
```
- View borrow history (member)
```
GET /api/borrow/history
```
## 4. Reports (admin only)
- Most borrowed books  
  ```
  GET /api/borrow/reports/most-borrowed
  ```
- Most active members  
  ```
  GET /api/borrow/reports/most-active
  ```
- Book availability  
  ```
  GET /api/borrow/reports/availability
  ```

---

## Postman Collection

Import the file "`Nalanda.postman_collection.json`" (included in repo root).  
Steps:
1. Import into Postman  
2. Test APIs

---

## Setup & Run Locally

- 1. Clone the repository
```bash
git clone https://github.com/Dhanu81-DEV/Huemn-Task.git
cd nalanda
```
- 2. Install dependencies
```bash
npm install
```
- 3. Configure environment
* Open .env and edit values:
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/nalanda
JWT_SECRET=super-secret-key
```
- 4. Run the server
```bash
npm run dev
```
Server runs on: http://localhost:4000
