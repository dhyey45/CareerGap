# CareerGap — Full Stack Hackathon Edition

Built to match the recommended stack:
- React.js
- Node.js / Express.js
- PostgreSQL
- Apache / Nginx: deployment-ready (optional for the 4-hour demo)

## Features
Student digital profile, target career selection, career readiness score, skill-gap analysis, personalized roadmap, skills/projects/certifications/internships, career simulator and career comparison.

## 1. Install prerequisites
- Node.js LTS
- PostgreSQL
- VS Code

## 2. Create PostgreSQL database
Open pgAdmin or psql and create a database named:
careergap

Do NOT create tables manually. The Express server creates them and seeds demo data.

## 3. Configure server
Copy:
server/.env.example
to:
server/.env

Then change YOUR_PASSWORD to your PostgreSQL password.

Example:
DATABASE_URL=postgresql://postgres:MyPassword@localhost:5432/careergap

## 4. Install dependencies
Open a terminal in this project folder:

npm install
npm run install-all

## 5. Start
npm run dev

Frontend:
http://localhost:5173

API:
http://localhost:5000/api/health

## Demo flow
Dashboard -> Career Simulator -> choose AI/ML -> Career Roadmap -> Skills & Projects -> Profile.

## Deployment
For the hackathon demo, localhost is fastest.
For deployment, build React:
cd client
npm run build

Serve client/dist using Nginx or Apache and proxy /api to the Express server.
