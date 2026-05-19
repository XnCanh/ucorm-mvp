import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI-Powered ORM - Hộp Thư Quản Trị Đánh Giá Khách Hàng Bằng AI',
  description: 'Nền tảng quản trị đánh giá khách hàng thông minh. Tự động lấy đánh giá từ Google Maps, phân tích sắc thái bằng AI và gợi ý các phản hồi chuyên nghiệp chỉ trong tích tắc.',
  authors: [{ name: 'UCTalent Labs' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
