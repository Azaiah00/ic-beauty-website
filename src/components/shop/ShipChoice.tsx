"use client";
/** Required pickup-or-shipping choice on each product. Checkout is blocked until one is picked. */
export function ShipChoice({ product, fee }: { product: string; fee: string }) {
  const msg = "Please select pickup at the studio or shipping before you check out.";
  return (
    <label className="w-full">
      <span className="mb-1.5 block font-sans text-[0.66rem] font-medium uppercase tracking-[0.14em] text-plum-800">
        Pickup or shipping <span className="text-[#8a3a26]">(required)</span>
        <span className="sr-only"> for {product}</span>
      </span>
      <select
        name="m"
        defaultValue=""
        required
        onInvalid={(e) => e.currentTarget.setCustomValidity(msg)}
        onChange={(e) => e.currentTarget.setCustomValidity("")}
        className="min-h-10 w-full rounded-pill border border-plum-800/15 bg-white px-3 text-[0.88rem] text-plum-900 invalid:text-plum-700"
      >
        <option value="" disabled>Select one</option>
        <option value="pickup">Pickup at studio · free</option>
        <option value="ship">Ship to me · from {fee}</option>
      </select>
    </label>
  );
}
