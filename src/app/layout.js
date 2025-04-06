import { Inter } from 'next/font/google';
import AuthProvider from './providers';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'E-Commerce Application',
  description: 'CENG 495 Cloud Computing Spring 2024-2025 Assignment-1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <AuthProvider>
          <header className="bg-gray-900 shadow-md">
            <div className="container mx-auto p-4 flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">E-Commerce Store</Link>
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href="/" className="hover:text-blue-400 transition">
                      Home
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </header>

          <main className="container mx-auto p-4 flex-grow">
            {children}
          </main>

          <footer className="bg-gray-900 mt-auto py-6">
            <div className="container mx-auto px-4 text-center text-gray-400">
              <p>&copy; {new Date().getFullYear()} CENG 495 Cloud Computing Assignment</p>
              <p className="text-sm mt-1">METU Department of Computer Engineering</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}