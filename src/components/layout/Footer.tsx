import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon as Instagram, FacebookIcon as Facebook, YoutubeIcon as Youtube, TikTokIcon } from "@/components/ui/SocialIcons";
import { business, links, nav, formatHour, DISCLAIMER, bookHref } from "@/lib/site";
import { ICMark } from "@/components/brand/ICMark";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function Footer() {
  const year = new Date().getFullYear();
  const socials = [
    { href: links.instagram, label: "Instagram", Icon: Instagram },
    { href: links.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: links.youtube, label: "YouTube", Icon: Youtube },
    { href: links.facebook, label: "Facebook", Icon: Facebook },
  ];
  return (
    <footer className="relative overflow-hidden bg-plum-950 text-lilac" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site footer</h2>
      <div className="container-x relative flex flex-col items-center border-b border-lilac/10 py-16 text-center">
        <ICMark className="h-16 w-auto text-lilac" title="" />
        <p className="mt-6 font-display text-[clamp(2rem,1.4rem+2vw,3.2rem)] italic leading-tight text-bone">I.C. Beauty <span className="text-brass-soft">·</span> I.C. Success <span className="text-brass-soft">·</span> I.C. You</p>
      </div>
      <div className="container-x relative grid gap-14 py-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-brass-soft">The H.A.I.R. Letter</p>
          <p className="mt-4 max-w-md font-display text-[2.3rem] leading-[1.08] text-bone">
            Healthy awareness is rare. <span className="italic-accent text-brass-soft">Get yours weekly.</span>
          </p>
          <p className="mt-4 max-w-md text-[0.98rem] text-lilac/85">Scalp-care tips, class dates, and first access to new openings. Class is in session.</p>
          <div className="mt-6 max-w-md">
            <NewsletterForm />
          </div>
          <ul className="mt-10 flex gap-2" aria-label="Social media">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in a new tab)`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-lilac/20 text-lilac transition hover:border-brass-soft hover:text-brass-soft">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-[0.95rem] sm:grid-cols-3 lg:col-span-7">
          <div>
            <p className="eyebrow text-lilac/75">Explore</p>
            <ul className="mt-4 space-y-2.5">
              {nav.map((n) => (
                <li key={n.href}><Link className="link-underline text-bone/85 hover:text-bone" href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-lilac/75">Start here</p>
            <ul className="mt-4 space-y-2.5">
              <li><Link className="link-underline text-bone/85 hover:text-bone" href={bookHref}>Book a discovery call</Link></li>
              <li><Link className="link-underline text-bone/85 hover:text-bone" href="/scalp-check">Scalp Self-Check</Link></li>
              <li><Link className="link-underline text-bone/85 hover:text-bone" href="/faq">FAQ</Link></li>
              <li><Link className="link-underline text-bone/85 hover:text-bone" href="/contact">Contact</Link></li>
              <li><Link className="link-underline text-bone/85 hover:text-bone" href="/links">All links</Link></li>
              <li><Link className="link-underline text-bone/85 hover:text-bone" href="/policies">Policies</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="eyebrow text-lilac/75">Visit the studio</p>
            <address className="mt-4 space-y-3 not-italic text-bone/85">
              <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-bone">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-brass-soft" aria-hidden="true" strokeWidth={1.75} />
                <span>{business.address.street}<br />{business.address.city}, VA {business.address.postalCode}</span>
              </a>
              <a href={business.phoneHref} className="flex items-center gap-2 hover:text-bone">
                <Phone className="h-4 w-4 text-brass-soft" aria-hidden="true" strokeWidth={1.75} />{business.phone}
              </a>
              <a href={`mailto:${business.email}`} className="flex items-center gap-2 break-all hover:text-bone">
                <Mail className="h-4 w-4 shrink-0 text-brass-soft" aria-hidden="true" strokeWidth={1.75} />{business.email}
              </a>
            </address>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[0.85rem]">
              {business.hours.map((h) => (
                <div key={h.day} className="contents">
                  <dt className="text-lilac/75">{h.short}</dt>
                  <dd className="text-bone/85">{h.open ? `${formatHour(h.open)} – ${formatHour(h.close)}` : "Closed"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </nav>
      </div>

      <div className="container-x relative border-t border-lilac/10 py-8 text-[0.8rem] text-lilac/75">
        <p className="max-w-4xl">{DISCLAIMER}</p>
        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row">
          <p>© {year} {business.legalName}. All rights reserved.</p>
          <p>The H.A.I.R. Wellness Method™ · Site by Couture House Co.</p>
        </div>
      </div>
    </footer>
  );
}
