import type { ReactNode } from 'react';
import TopBar from '../organisms/TopBar';
import Navbar from '../organisms/Navbar';
import Footer from '../organisms/Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
