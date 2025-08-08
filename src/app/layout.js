import localFont from 'next/font/local';
import './globals.css';
import NoorooNavbar from '@/components/ui/nooroo-navbar';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata = {
  title: 'Nooroo Fi - Prediction Market Aggregator',
  description: 'AI-powered prediction market analytics dashboard and scanner',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NoorooNavbar />
        {children}
      </body>
    </html>
  );
}
