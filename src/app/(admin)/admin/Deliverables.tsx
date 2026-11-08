/** Owner dashboard → Deliverables: everything Couture House made for I.C. Beauty, plus Iisha's own uploads. */
import { Download, Eye, FileText, Upload, Trash2, QrCode, Printer, Mail, Globe, FolderOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import { listDeliverables, MAX_UPLOAD, type Deliverable } from "@/lib/server/deliverables";

const card = "rounded-[1.4rem] bg-white shadow-[0_1px_2px_rgba(36,19,42,0.05),0_18px_40px_-28px_rgba(36,19,42,0.35)]";
const GROUP_ICON: Record<string, typeof QrCode> = { "QR codes": QrCode, "Business card": Printer, "Event banner": Printer, Newsletter: Mail, Website: Globe, Uploads: FolderOpen };

const size = (n: number) => (n < 0 ? "" : n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);
const kind = (t: string) => (t === "application/pdf" ? "PDF" : t === "image/svg+xml" ? "SVG" : t.startsWith("image/") ? t.split("/")[1].toUpperCase().replace("JPEG", "JPG") : t.startsWith("video/") ? "Video" : "File");
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" });

const MSG: Record<string, [boolean, string]> = {
  uploaded: [true, "Uploaded. It's saved in your library below."],
  deleted: [true, "Deleted."],
  toolarge: [false, `That file is over ${MAX_UPLOAD / 1024 / 1024} MB. Send big files (like videos) to Couture House and we'll add them for you.`],
  nofile: [false, "Choose a file first."],
};

function Tile({ d }: { d: Deliverable }) {
  const src = `/api/admin/files?id=${encodeURIComponent(d.id)}`;
  const isImg = d.type.startsWith("image/");
  return (
    <li className={`${card} flex flex-col overflow-hidden`}>
      <a href={src} target="_blank" rel="noopener" className="group relative block aspect-[4/3] overflow-hidden bg-[linear-gradient(135deg,#f1ebf3,#e9dfee)]" aria-label={`View ${d.title}`}>
        {isImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" loading="lazy" className={`h-full w-full transition duration-500 group-hover:scale-[1.03] ${d.id.startsWith("qr-") || d.type === "image/svg+xml" ? "object-contain p-6" : "object-cover object-top"}`} />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-amethyst">
            <FileText className="h-12 w-12" strokeWidth={1.2} aria-hidden="true" />
            <span className="rounded-full bg-white/70 px-3 py-1 text-[0.72rem] font-medium tracking-[0.12em] text-plum-900">{kind(d.type)}</span>
          </span>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-plum-950/80 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-bone backdrop-blur">{kind(d.type)}</span>
      </a>
      <div className="flex flex-1 flex-col p-4">
        <p className="font-medium leading-snug text-plum-900">{d.title}</p>
        {d.note && <p className="mt-1 text-[0.84rem] leading-relaxed text-plum-700">{d.note}</p>}
        <p className="mt-2 text-[0.75rem] text-plum-700/80">
          {d.source === "upload" ? `Uploaded by ${d.uploadedBy ?? "you"} · ` : "From Couture House · "}
          {day(d.date)}
          {size(d.size) && ` · ${size(d.size)}`}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <a href={src} target="_blank" rel="noopener" className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full border border-plum-800/15 px-4 text-[0.82rem] text-plum-900 transition hover:border-amethyst hover:text-amethyst">
            <Eye className="h-4 w-4" aria-hidden="true" /> View
          </a>
          <a href={`${src}&dl=1`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-full bg-plum-900 px-4 text-[0.82rem] text-bone transition hover:bg-amethyst">
            <Download className="h-4 w-4" aria-hidden="true" /> Download
          </a>
          {d.source === "upload" && (
            <form method="post" action="/api/admin/files">
              <input type="hidden" name="action" value="delete" />
              <input type="hidden" name="id" value={d.id} />
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-plum-800/15 text-[#b4533c] hover:border-[#b4533c]" aria-label={`Delete ${d.title}`} title="Delete">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      </div>
    </li>
  );
}

export async function DeliverablesView({ msg }: { msg?: string }) {
  const all = await listDeliverables();
  const groups = [...new Set(all.map((d) => d.group))];
  const m = msg ? MSG[msg] : undefined;
  return (
    <div className="mt-6 space-y-8">
      {m && (
        <p className={`flex items-start gap-2 rounded-2xl px-4 py-3 text-[0.9rem] ${m[0] ? "bg-[#e3efe8] text-[#24603f]" : "bg-[#f8e6e1] text-[#8a3a26]"}`} role="status">
          {m[0] ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          {m[1]}
        </p>
      )}

      <section className={`${card} overflow-hidden`}>
        <div className="grid gap-5 bg-[linear-gradient(135deg,#3a1d45_0%,#24132a_70%)] p-5 text-bone sm:p-7 md:grid-cols-[1fr_minmax(0,1.1fr)] md:items-center">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-brass-soft">Your library</p>
            <h2 className="mt-2 font-display text-[1.7rem] leading-tight">Everything we&apos;ve made for you, in one place.</h2>
            <p className="mt-2 text-[0.9rem] text-bone/70">View or download any file whenever you need it. Add your own files too: logos, photos, flyers, receipts.</p>
          </div>
          <form method="post" action="/api/admin/files" encType="multipart/form-data" className="grid gap-3 rounded-2xl bg-white/8 p-4 ring-1 ring-white/10">
            <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-bone/30 px-4 py-4 text-center text-[0.88rem] text-bone/80 transition hover:border-brass-soft hover:text-bone">
              <Upload className="h-5 w-5 text-brass-soft" aria-hidden="true" />
              <span>Choose a file to upload</span>
              <span className="text-[0.72rem] text-bone/50">Up to {MAX_UPLOAD / 1024 / 1024} MB · photos, PDFs, documents</span>
              <input type="file" name="file" required className="mt-2 w-full max-w-xs text-[0.78rem] text-bone/80 file:mr-3 file:rounded-full file:border-0 file:bg-bone file:px-3 file:py-1.5 file:text-[0.75rem] file:text-plum-900" />
            </label>
            <input name="title" placeholder="Name it (optional)" maxLength={120} className="min-h-11 rounded-xl border border-white/15 bg-white/10 px-3 text-[0.92rem] text-bone placeholder:text-bone/45 focus:border-brass-soft focus:outline-none" />
            <button className="min-h-11 rounded-full bg-bone text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900 transition hover:bg-brass-soft">Upload</button>
          </form>
        </div>
      </section>

      {groups.map((g) => {
        const Icon = GROUP_ICON[g] ?? FolderOpen;
        const items = all.filter((d) => d.group === g);
        return (
          <section key={g} aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className="flex items-center gap-2.5 font-display text-[1.45rem] text-plum-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mist text-amethyst"><Icon className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /></span>
              {g === "Uploads" ? "Your uploads" : g}
              <span className="ml-1 text-[0.85rem] font-sans text-plum-700">{items.length}</span>
            </h2>
            <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {items.map((d) => <Tile key={d.id} d={d} />)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
