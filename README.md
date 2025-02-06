# Social Media Dashboard

A modern social media analytics dashboard built with Next.js 15, React 19, and TypeScript. This application provides a centralized view of social media metrics and engagement analytics across multiple platforms.

## Features

- 📊 Real-time analytics dashboard
- 🎨 Modern UI with Shadcn UI and Tailwind CSS
- 🌙 Dark/Light mode support
- 📱 Fully responsive design
- ⚡ Real-time data updates

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI
- **Authentication:** NextAuth.js
- **State Management:** React Hooks
- **Data Fetching:** React Query
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IdrisKulubi/commsdashboard.git
cd commsdashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
# Add your environment variables here
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   └── dashboard/
├── lib/
├── types/
└── public/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

## Support

For support, email kulubiidris@gmail.com or open an issue in the repository.
