import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { business, formatHour } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact I.C. Beauty in Henrico, VA",
  description: "Contact Iisha C. Silver at I.C. Beauty, 8030 W Broad St, Suite 117, Henrico, VA 23294. Call (804) 397-3340 or email icbeautyinyou@gmail.com.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Contact", path: "/contact" }]), { "@type": "ContactPage", name: "Contact I.C. Beauty" })} />
      <PageHero crumbs={[{ name: "Contact", href: "/contact" }]} eyebrow="Contact" title={<>Reach out. <span className="italic-accent text-amethyst">Let&apos;s talk.</span></>} lede={<p>Let us know if there&apos;s anything we can do for you.</p>} />
      <section className="bg-bone py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="rounded-card border border-plum-800/10 bg-paper p-6 sm:p-10 lg:col-span-7"><ContactForm /></div>
          <aside className="space-y-6 lg:col-span-4 lg:col-start-9">
            <address className="space-y-4 not-italic text-plum-800">
              <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex gap-3"><MapPin className="mt-1 h-5 w-5 shrink-0 text-amethyst" aria-hidden="true" /><span>{business.legalName}<br />{business.address.street}<br />{business.address.city}, VA {business.address.postalCode}</span></a>
              <a href={business.phoneHref} className="flex gap-3"><Phone className="h-5 w-5 text-amethyst" aria-hidden="true" />{business.phone}</a>
              <a href={`mailto:${business.email}`} className="flex gap-3 break-all"><Mail className="h-5 w-5 shrink-0 text-amethyst" aria-hidden="true" />{business.email}</a>
            </address>
            <div className="rounded-card bg-plum-950 p-7 text-bone">
              <p className="eyebrow flex items-center gap-2 text-brass-soft"><Clock className="h-4 w-4" aria-hidden="true" />Hours of operation</p>
              <dl className="mt-4 space-y-1.5 text-[0.95rem]">
                {business.hours.map((h) => (
                  <div key={h.day} className="flex justify-between border-b border-lilac/10 py-1.5"><dt className="text-lilac/70">{h.day}</dt><dd>{h.open ? `${formatHour(h.open)} – ${formatHour(h.close)}` : "Closed"}</dd></div>
                ))}
              </dl>
            </div>
            <div className="overflow-hidden rounded-card border border-plum-800/10">
              <iframe
                title="Map to I.C. Beauty, 8030 W Broad St, Henrico VA"
                src="https://www.google.com/maps?q=8030+W+Broad+St+Suite+117,+Henrico,+VA+23294&output=embed"
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
