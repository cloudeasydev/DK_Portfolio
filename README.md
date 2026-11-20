# DevOps Engineer CV — Next.js 16.2 + MongoDB

Full-stack portfolio converted to **Next.js 16.2** (App Router). Admin panel at `/admin`. Blog posts can be **public** (Articles) or **private**.

## Setup

`.env`:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
ADMIN_EMAIL=divyanshu1300@gmail.com
ADMIN_PASSWORD=Div@123@456#
```

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

### Admin login

- Email: `divyanshu1300@gmail.com`
- Password: `Div@123@456#`

## What's included

- Public site: Bio, Articles, Skills, Certifications, Experience, Projects
- `/admin` — Profile, Blog (public/private), Projects, image uploads
- API routes under `/api/*` (MongoDB Atlas)
- No separate Express server needed

## Stack

- Next.js 16.2 + React 19
- MongoDB Atlas (content + images)
- JWT admin auth
