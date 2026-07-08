(The file `c:\Users\mit\OneDrive\Desktop\FlashForge\README.md` exists, but is empty)
# FlashForge

FlashForge is a lightweight flashcard generator and study app. Upload PDFs or create decks manually, then study using generated flashcards. The project includes a Node.js + Express backend (with Mongoose) and a Vite + React frontend.

## Features
- Upload a PDF and generate flashcards using Google Generative AI (Gemini).
- Create, read, update, and delete decks.
- Simple per-session deck isolation via `sessionId`.

## Tech stack
- Backend: Node.js, Express, Mongoose
- Frontend: React (Vite)
- AI integration: `@google/generative-ai` (Gemini model)

## Repository structure

- `backend/` — Express API and data models
	- `server.js` — app entrypoint
	- `config/db.js` — MongoDB connection (uses `MONGODB_URI`)
	- `models/Deck.js` — Mongoose schema for decks
	- `routes/decks.js` — REST endpoints for deck CRUD
	- `routes/generate.js` — PDF upload + Gemini generation endpoint
- `frontend/` — Vite + React app
	- `src/pages/` — `CreateDeck`, `Dashboard`, `StudyDeck` pages

## Environment variables
Create a `.env` file in the `backend/` folder with at least:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/flashforge
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

## Setup & Run

Backend

```
cd backend
npm install
# development
npm run dev
# or start
npm start
```

Frontend

```
cd frontend
npm install
npm run dev
```

Open the frontend dev server (Vite) URL shown in the terminal.

## API Overview

- GET `/api/decks?sessionId=<sessionId>`
	- Returns all decks for the session.
- GET `/api/decks/:id?sessionId=<sessionId>`
	- Returns a specific deck.
- PUT `/api/decks/:id?sessionId=<sessionId>`
	- Update deck (JSON body).
- DELETE `/api/decks/:id?sessionId=<sessionId>`
	- Delete a deck.
- POST `/api/generate`
	- Multipart/form-data upload. Fields:
		- `file` — PDF file (required)
		- `sessionId` — session identifier (required)
		- `title`, `learningGoal`, `cardType`, `difficulty`, `numberOfCards` — optional generation settings
	- Returns created deck (stored in MongoDB).

Note: many endpoints expect `sessionId` to scope decks to a user/session.

## Development notes
- Backend scripts: see `backend/package.json` (`dev` and `start` both run `server.js`).
- Frontend scripts: see `frontend/package.json` (`dev`, `build`, `preview`).
- DB connection lives in `backend/config/db.js` and reads `MONGODB_URI`.

## Contributing
- Fork the repo, create a feature branch, and open a PR.

## License
This project is provided as-is. Add a license if you plan to open-source it.

