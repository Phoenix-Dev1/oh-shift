# Intro

Oh-Shift is a modern shift scheduling and management web application designed for managers and employees to streamline work schedules efficiently. Built with Next.js, Prisma, MongoDB, and FullCalendar, it offers an intuitive drag-and-drop interface, real-time updates, and a responsive UI, ensuring seamless shift planning across all devices.

Project Live at: [https://oh-shift.vercel.app/](https://oh-shift.vercel.app/)

![Oh-Shift](https://github.com/Phoenix-Dev1/oh-shift/blob/main/public/banner-oh-shift.png)

---

## Features

- **Dynamic Shift Scheduling**: Easily create, update, and manage employee shifts using a seamless drag-and-drop interface with real-time feedback.
- **Role-Based Access Control**: Managers can create and assign shifts, while employees have read-only access to their schedules for a secure and streamlined experience.
- **Google and GitHub Authentication**: Secure login for managers using NextAuth.js with support for Google and GitHub authentication providers.
- **Interactive FullCalendar Integration**: Integrated with FullCalendar to display shifts in a professional weekly time-grid format, with detailed event popups on hover.
- **Mobile-Friendly Design**: Fully responsive and optimized for mobile devices, allowing users to manage and view schedules effortlessly on any screen size.
- **Optimistic UI and Real-Time Updates**: Instant UI feedback when adding, updating, or deleting employees and shifts, ensuring a smooth and efficient workflow.
---

## Technologies used

- [React](https://react.dev/) - Front-End JavaScript library.
- [Next.js](https://nextjs.org/) - Full-stack React framework with built-in routing, server-side rendering (SSR), static site generation (SSG), and API routes for optimized web applications.
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for responsive and modern UI design.
- [MongoDB](https://www.mongodb.com/) - NoSQL database for scalable and flexible data storage.
- [TypeScript](https://www.typescriptlang.org/) - Superset of JavaScript that adds static typing, improving code quality, maintainability, and developer productivity.
- [FullCalendar](https://fullcalendar.io/) - Feature-rich JavaScript calendar library for scheduling, event management, and timeline visualization in web applications.
- [Prisma](https://www.prisma.io/) - Modern database toolkit and ORM (Object-Relational Mapping) for TypeScript and Node.js, simplifying database access with a type-safe query API.
- [NextAuth.js](https://next-auth.js.org/) - Authentication library for Next.js with built-in support for OAuth providers (Google, GitHub, etc.), credentials, and JWT-based authentication.
- [DnD-Kit](https://dndkit.com/) - Lightweight and customizable drag-and-drop library for React, offering accessible and performant drag-and-drop interactions.
- [Framer Motion](https://motion.dev/) - Advanced animation library for React, providing declarative and physics-based animations for creating fluid UI transitions and effects.
- ***

## Build

1. Clone this repository

```bash
git clone https://github.com/Phoenix-Dev1/oh-shift.git && cd oh-shift
```

2. Install project dependencies

```bash
npm install
```

## Setup

3. Set up environment variables (Required)
   -- Create a .env file in the root directory.
   -- Add the necessary API keys and configuration.

- DATABASE_URL = 
- NEXTAUTH_SECRET = 

- GITHUB_ID =
- GITHUB_CLIENT_SECRET =
- GOOGLE_CLIENT_ID =
- GOOGLE_CLIENT_SECRET =

## Start the project
4. Run the project - **Keys Needed**

```bash
npm run dev
```
