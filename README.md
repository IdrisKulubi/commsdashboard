# Communications Dashboard

A dashboard for tracking and analyzing communications metrics across different platforms and business units.

## Recent Updates

### Metrics Fetching Improvements

I've made significant improvements to how metrics are fetched throughout the application:

1. **Server Actions Instead of API Routes**
   - Replaced all API route calls with direct server actions
   - Eliminated network timeouts and connection errors
   - Improved performance by reducing network overhead

2. **Enhanced Error Handling**
   - Added comprehensive try/catch blocks around all data fetching
   - Implemented graceful fallbacks to empty arrays when data fetching fails
   - Added detailed logging for easier debugging

3. **UI Improvements**
   - Added Suspense boundaries with Skeleton loaders for better loading states
   - Wrapped pages in DashboardShell for consistent layout
   - Improved component structure for better maintainability and code to be neat and easy to navigate

4. **Data Processing Optimizations**
   - Improved calculation of total metrics to avoid double-counting
   - Enhanced filtering logic for more accurate metrics
   - Added proper typing for all data structures

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

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your database connection in `.env`
4. Run the development server with `npm run dev`

## Architecture

The application uses:
- Next.js 14 with App Router
- Drizzle ORM for database access
- React Server Components for efficient rendering
- Tailwind CSS and Shadcn UI for styling
- TypeScript for type safety

## Data Flow

1. Server Components fetch data directly from the database using Drizzle ORM
2. Data is processed and passed to Client Components
3. Client Components handle user interactions and filtering
4. Updates are made through Server Actions for optimal performance

## Troubleshooting

If you encounter issues with data fetching:
1. Check database connection settings
2. Verify that the database schema matches the expected structure
3. Look for detailed error logs in the console
4. Ensure server actions are properly exported with the "use server" directive

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
