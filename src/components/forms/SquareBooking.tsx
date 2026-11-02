import { ArrowUpRight } from "lucide-react";

/**
 * Iisha's live Square Appointments booking flow, embedded on her own site. Real services, prices and
 * open times; every booking lands in her Square calendar. Swap for the custom portal later (UI seam).
 */
export function SquareBooking({ src, title }: { src: string; title: string }) {
  return (
    <div>
      <iframe
        title={title}
        src={src}
        allow="payment"
        loading="eager"
        className="block h-[78vh] min-h-[640px] w-full rounded-xl border-0 bg-white"
      />
      <p className="mt-3 text-[0.85rem] text-plum-700">
        Booking not loading?{" "}
        <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-amethyst underline decoration-amethyst/40 underline-offset-4">
          Open Iisha&apos;s booking page <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </p>
    </div>
  );
}
