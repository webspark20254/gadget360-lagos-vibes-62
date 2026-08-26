import LegalLayout from "./LegalLayout";

const Warranty = () => (
  <LegalLayout
    kicker="Warranty"
    title="Warranty cover."
    intro="Every device we sell is authentic and carries cover. Here's exactly what is covered, for how long, and how to claim."
    seoTitle="Warranty Policy — Gadget360.ng Lagos"
    seoDescription="Warranty cover on phones, laptops, consoles and accessories from Gadget360.ng: cover periods for new and pre-owned devices, what's excluded, and how to claim on WhatsApp."
    canonical="/warranty"
  >
    <section>
      <h2>Cover periods</h2>
      <ul>
        <li><strong>New, sealed devices</strong> — manufacturer warranty as stated by the brand, supported by us for the duration.</li>
        <li><strong>Pre-owned and open-box devices</strong> — 3 months Gadget360.ng cover on hardware faults, from the delivery date.</li>
        <li><strong>Batteries and charging accessories</strong> — 1 month cover against failure.</li>
        <li><strong>Cables, cases and consumable accessories</strong> — 7-day dead-on-arrival cover.</li>
      </ul>
      <p>
        The cover that applies to your unit is the one we confirm in writing in your WhatsApp order thread
        or on your receipt.
      </p>
    </section>

    <section>
      <h2>What is covered</h2>
      <ul>
        <li>Hardware faults that were not caused by use — motherboard, charging port, speaker, camera or display failure.</li>
        <li>Battery health falling well below what was stated at sale, within the cover period.</li>
        <li>Software faults on the original operating system that we cannot resolve remotely.</li>
      </ul>
    </section>

    <section>
      <h2>What voids cover</h2>
      <ul>
        <li>Physical damage: drops, cracked screens, bent frames, crushed ports.</li>
        <li>Liquid damage, including corrosion visible on the liquid-contact indicator.</li>
        <li>Repairs, part swaps or board-level work by anyone other than us.</li>
        <li>Broken seals, removed serial numbers or tamper stickers.</li>
        <li>Unauthorised firmware, jailbreaking, rooting or bypass software.</li>
        <li>Loss, theft, or damage from an unstable power supply or a non-genuine charger.</li>
      </ul>
    </section>

    <section>
      <h2>How to claim</h2>
      <ul>
        <li><strong>1.</strong> Message our WhatsApp line with the device, the fault and your order reference.</li>
        <li><strong>2.</strong> Back up your data and sign out of iCloud, Google or your console account — we cannot service a locked device.</li>
        <li><strong>3.</strong> Bring the device to Ikeja or Computer Village, or arrange a pickup with us.</li>
        <li><strong>4.</strong> We diagnose, then repair or replace. Where neither is possible within the cover period, we refund.</li>
      </ul>
    </section>

    <section>
      <h2>Turnaround</h2>
      <p>
        Most in-warranty repairs are completed in <strong>3–7 working days</strong>. If a part has to be
        sourced we tell you up front and keep you updated in the same WhatsApp thread.
      </p>
    </section>

    <section>
      <h2>Your data</h2>
      <p>
        Always back up before a repair. We are not able to guarantee data on a device sent in for service,
        and some board-level repairs require a full wipe.
      </p>
    </section>
  </LegalLayout>
);

export default Warranty;
