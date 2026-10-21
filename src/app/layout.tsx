import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cormorant, jost } from "./fonts";
import { SITE_URL, business } from "@/lib/site";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { ExitIntent } from "@/components/ExitIntent";
import { Wordmark } from "@/components/brand/ICMark";
import { JsonLd } from "@/components/JsonLd";
import { graph, businessNode, personNode, websiteNode, methodNode } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hair Loss Specialist & Hair Wellness Educator in Richmond, VA | I.C. Beauty",
    template: "%s | I.C. Beauty",
  },
  description:
    "Iisha C. Silver, holistic hair recovery practitioner in Henrico (Richmond), VA. Microscopic scalp analysis, hair loss recovery programs, stylist education, and speaking. Creator of The H.A.I.R. Wellness Method™.",
  applicationName: "I.C. Beauty",
  authors: [{ name: business.owner.name, url: `${SITE_URL}/about` }],
  creator: business.owner.name,
  publisher: business.legalName,
  keywords: [
    "hair loss specialist Richmond VA",
    "trichologist Richmond VA",
    "hair loss specialist Henrico",
    "scalp analysis Richmond",
    "Black hair loss specialist Virginia",
    "traction alopecia help Richmond",
    "hair recovery program",
    "stylist education Richmond",
    "hair wellness speaker",
    "H.A.I.R. Wellness Method",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "I.C. Beauty",
    title: "I.C. Beauty — Where hair, health & education connect",
    description: "Hair loss recovery, scalp wellness, stylist education, and speaking with Iisha C. Silver, creator of The H.A.I.R. Wellness Method™. Henrico / Richmond, VA.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "I.C. Beauty — Where hair, health & education connect" }],
  },
  twitter: { card: "summary_large_image", title: "I.C. Beauty — Where hair, health & education connect", images: ["/og.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: true, address: true, email: true },
  category: "health & beauty",
};

export const viewport: Viewport = {
  themeColor: "#f8f4ee",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

/** Runs before paint: enables motion styles only when JS + motion are OK; safety net un-hides content if hydration stalls. */
const motionBoot = `(function(){try{var d=document.documentElement;if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion');setTimeout(function(){if(!window.__icbReady)d.classList.remove('js-motion')},3500)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US" className={`${cormorant.variable} ${jost.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBoot }} />
      </head>
      <body className="min-h-dvh bg-bone">
        <JsonLd data={graph(businessNode(), personNode(), websiteNode(), methodNode())} />
        <Header mark={<Wordmark markClass="h-10 w-auto text-amethyst" className="text-plum-900" />} />
        <main id="main">{children}</main>
        <Footer />
        <SmoothScroll />
        <ExitIntent />
      </body>
    </html>
  );
}
