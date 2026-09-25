import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'TagChat | Thread & Tag Management',
  description: 'Threads as a Project Management Single Source of Truth (SSOT). Real-time collaboration, first-class tagging as an integrated documentation instrument, interactive polls, deep linking, and thread-scoped file annotations for high-velocity teams.',
  openGraph: {
    title: 'TagChat | Thread & Tag Management',
    description: 'Threads as a Project Management Single Source of Truth (SSOT). Real-time collaboration, first-class tagging as an integrated documentation instrument, interactive polls, deep linking, and thread-scoped file annotations for high-velocity teams.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TagChat | Thread & Tag Management',
    description: 'Threads as a Project Management Single Source of Truth (SSOT). Real-time collaboration, first-class tagging as an integrated documentation instrument, interactive polls, deep linking, and thread-scoped file annotations for high-velocity teams.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
