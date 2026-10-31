import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, CalendarCheck, ShieldAlert } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { Btn } from "@/components/ui/Btn";
import { ICMark } from "@/components/brand/ICMark";
import { articles, getArticle } from "@/lib/articles";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, articleNode, faqNode } from "@/lib/schema";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return {};
  return {
    title: a.question.length < a.title.length ? a.question : a.title,
    description: a.description,
    alternates: { canonical: `/learn/${a.slug}` },
    openGraph: { type: "article", title: a.title, description: a.description, publishedTime: a.published, modifiedTime: a.modified, authors: ["Iisha C. Silver"] },
  };
}

const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) notFound();
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Learn", path: "/learn" }, { name: a.title, path: `/learn/${a.slug}` }]), articleNode(a), faqNode([{ q: a.question, a: a.answer }], `/learn/${a.slug}`))} />
      <PageHero
        crumbs={[{ name: "Learn", href: "/learn" }, { name: a.category, href: `/learn/${a.slug}` }]}
        eyebrow={`${a.category} · ${a.minutes} min read`}
        title={a.title}
      />
      <article className="bg-bone py-16 sm:py-24">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* Direct answer (AEO): 40–60 words, definition-first */}
            <section aria-labelledby="short-answer" className="rounded-card border-l-4 border-amethyst bg-paper p-7 sm:p-9">
              <h2 id="short-answer" className="eyebrow text-amethyst">The short answer</h2>
              <p className="mt-4 font-display text-[1.6rem] leading-[1.4] text-plum-900">{a.answer}</p>
            </section>

            <div className="mt-12 space-y-12">
              {a.sections.map((s) => (
                <section key={s.h2}>
                  <h2 className="font-display text-[2.3rem] leading-tight text-plum-900">{s.h2}</h2>
                  {s.body.map((p) => (
                    <p key={p} className="mt-4 text-[1.1rem] leading-[1.75] text-plum-800">{p}</p>
                  ))}
                  {s.list && (
                    <ul className="mt-5 space-y-2.5">
                      {s.list.map((l) => (
                        <li key={l} className="flex gap-3 text-[1.06rem] text-plum-800">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amethyst" aria-hidden="true" />
                          {l}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <aside className="mt-12 flex gap-4 rounded-2xl border border-brass-deep/30 bg-brass-soft/15 p-6 text-plum-800">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" />
              <p className="text-[0.98rem]">
                <strong className="font-medium">When to see a dermatologist:</strong> sudden or patchy loss, smooth or scarred skin where hair used to grow, pain, burning, or sores on the scalp. A board-certified dermatologist can diagnose medical causes, and Iisha is happy to work alongside your doctor.
              </p>
            </aside>

            {a.sources.length > 0 && (
              <section className="mt-12" aria-labelledby="sources">
                <h2 id="sources" className="eyebrow text-plum-700">Sources</h2>
                <ol className="mt-4 space-y-2 text-[0.95rem]">
                  {a.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-amethyst link-underline">
                        {s.label}
                        <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            <div className="mt-12"><Disclaimer /></div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-5">
              <div className="rounded-card bg-plum-950 p-7 text-bone">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-plum-800"><ICMark className="h-9 w-auto text-lilac" title="" /></span>
                  <div>
                    <p className="font-display text-xl">Iisha C. Silver</p>
                    <p className="text-[0.85rem] text-lilac/70">Holistic Hair Recovery Practitioner & Educator</p>
                  </div>
                </div>
                <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-lilac/70">
                  <CalendarCheck className="h-4 w-4 text-brass-soft" aria-hidden="true" strokeWidth={1.5} />
                  Last reviewed <time dateTime={a.modified}>{fmt(a.modified)}</time>
                </p>
                <Link href="/about" className="mt-4 inline-block text-[0.9rem] text-brass-soft link-underline">About the author</Link>
              </div>
              <div className="rounded-card border border-plum-800/10 bg-paper p-7">
                <p className="eyebrow text-amethyst">Next step</p>
                <p className="mt-3 font-display text-[1.7rem] leading-snug text-plum-900">Get answers for your hair, not just hair in general.</p>
                <div className="mt-5"><Btn href={a.cta.href} variant="primary">{a.cta.label}</Btn></div>
              </div>
              <nav aria-label="Related articles" className="rounded-card border border-plum-800/10 p-7">
                <p className="eyebrow text-plum-700">Keep learning</p>
                <ul className="mt-4 space-y-3">
                  {related.map((r) => (
                    <li key={r.slug}><Link href={`/learn/${r.slug}`} className="font-display text-[1.3rem] leading-snug text-plum-900 hover:text-amethyst">{r.title}</Link></li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </article>
      <CTABand />
    </>
  );
}
