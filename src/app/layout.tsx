import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Inter,
  Roboto,
  Open_Sans,
  Poppins,
  Lato,
  Nunito,
  Source_Sans_3,
  Ubuntu,
  Shadows_Into_Light,
  Indie_Flower,
  Permanent_Marker,
  Caveat_Brush,
  Gochi_Hand,
  Delius,
  Acme,
  Fira_Code,
  Source_Code_Pro,
  Roboto_Mono,
  Ubuntu_Mono,
  Space_Mono,
  Syne_Mono,
  Nova_Mono,
  Kode_Mono,
  Space_Grotesk,
} from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Additional UI fonts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Handwritten / playful UI fonts
const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-shadows-into-light",
  subsets: ["latin"],
  weight: "400",
});

const indieFlower = Indie_Flower({
  variable: "--font-indie-flower",
  subsets: ["latin"],
  weight: "400",
});

const permanentMarker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
});

const caveatBrush = Caveat_Brush({
  variable: "--font-caveat-brush",
  subsets: ["latin"],
  weight: "400",
});

const gochiHand = Gochi_Hand({
  variable: "--font-gochi-hand",
  subsets: ["latin"],
  weight: "400",
});

const delius = Delius({
  variable: "--font-delius",
  subsets: ["latin"],
  weight: "400",
});

const acme = Acme({
  variable: "--font-acme",
  subsets: ["latin"],
  weight: "400",
});

// Additional mono fonts
const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Extra mono faces for clearer testing variety
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const syneMono = Syne_Mono({
  variable: "--font-syne-mono",
  subsets: ["latin"],
  weight: "400",
});

const novaMono = Nova_Mono({
  variable: "--font-nova-mono",
  subsets: ["latin"],
  weight: "400",
});

const kodeMono = Kode_Mono({
  variable: "--font-kode-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "ByteBox - Developer Resource Dashboard",
  description: "A lightweight web dashboard for dev bookmarks, docs, APIs, commands, and snippets. Made with ❤️ by Pink Pixel",
  keywords: ["developer", "dashboard", "bookmarks", "snippets", "documentation", "tools"],
  authors: [{ name: "Pink Pixel", url: "https://pinkpixel.dev" }],
  creator: "Pink Pixel",
  openGraph: {
    title: "ByteBox - Developer Resource Dashboard",
    description: "Organize your dev resources like a pro",
    url: "https://pinkpixel.dev",
    siteName: "ByteBox",
    images: [
      {
        url: "/icon.png",
        width: 1200,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('bytebox-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetBrainsMono.variable} ${inter.variable} ${roboto.variable} ${openSans.variable} ${poppins.variable} ${lato.variable} ${nunito.variable} ${sourceSans.variable} ${ubuntu.variable} ${shadowsIntoLight.variable} ${indieFlower.variable} ${permanentMarker.variable} ${caveatBrush.variable} ${gochiHand.variable} ${delius.variable} ${acme.variable} ${firaCode.variable} ${sourceCodePro.variable} ${robotoMono.variable} ${ubuntuMono.variable} ${spaceMono.variable} ${syneMono.variable} ${novaMono.variable} ${kodeMono.variable} ${spaceGrotesk.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
