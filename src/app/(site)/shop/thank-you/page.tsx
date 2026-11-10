import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank You for Your Order",
  description: "Your I.C. Beauty order is in.",
  alternates: { canonical: "/shop/thank-you" },
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <section className="flex min-h-[80dvh] items-center bg-bone pb-20 pt-36">
      <div className="container-x max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-amethyst" strokeWidth={1.2} aria-hidden="true" />
        <p className="eyebrow mt-6 text-amethyst">Order received</p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,1.8rem+2.4vw,3.6rem)] leading-[1.05] text-plum-900">
          Thank you. <span className="italic-accent text-amethyst">Your order is in.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[1.05rem] text-plum-700">
          Square has emailed your receipt. Iisha will let you know when your order is ready for pickup or on its way. Questions? Call or text{" "}
          <a href={business.phoneHref} className="link-underline text-plum-900">{business.phone}</a>.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Btn href="/shop">Keep shopping</Btn>
          <Btn href="/hub" variant="outline">Visit The Hub</Btn>
        </div>
      </div>
    </section>
  );
}
