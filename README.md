# DevTrack

DevTrack is a project and issue tracking application for organizing team work, tracking progress, and keeping project discussions and updates in one place.

## Features

- Project workspaces with owner, Collaborator, and Viewer roles
- Dashboard analytics for project and issue progress
- Issue creation, assignment, status and priority tracking, editing, and deletion
- Issue comments with permission-aware deletion
- Project activity history
- Cloudinary-backed issue attachments
- Member search by username or email and owner-managed project access

## Tech stack

- Frontend: React, React Router, Vite, Tailwind CSS, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- File storage: Cloudinary

## Setup

1. Install dependencies in both `Backend` and `Frontend`:

   ```powershell
   cd Backend
   npm install
   cd ..\Frontend
   npm install
   ```

2. Configure the environment variables listed below in `Backend/.env`. Set `CORS_ORIGIN` to the frontend origin.
3. Start the backend in one terminal:

   ```powershell
   cd Backend
   npm run dev
   ```

4. Start the frontend in another terminal:

   ```powershell
   cd Frontend
   npm run dev
   ```

5. Open the local Vite URL, register an account, and log in.

## Environment variables

Backend:

- `PORT`
- `CORS_ORIGIN`
- `MONGODB_URI`
- `ACCESS_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRY`
- `REFRESH_TOKEN_SECRET`
- `REFRESH_TOKEN_EXPIRY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Frontend:

- `VITE_API_URL` (optional; defaults to `http://localhost:8000/api/v1`)

Keep credentials in local environment files and never commit their values.
