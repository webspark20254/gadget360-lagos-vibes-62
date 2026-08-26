import LegalLayout from "./LegalLayout";

const Privacy = () => (
  <LegalLayout
    kicker="Privacy"
    title="Privacy Policy."
    intro="What we collect when you browse, order or chat with Gadget360.ng — and what we never do with it."
    seoTitle="Privacy Policy — Gadget360.ng"
    seoDescription="How Gadget360.ng collects, uses and protects your personal data when you shop, create an account or order on WhatsApp. Nigerian NDPR-aligned."
    canonical="/privacy"
  >
    <section>
      <h2>Who we are</h2>
      <p>
        Gadget360.ng is a gadget retailer operating from 24 Adegbola Street, Ikeja and
        8 Oshitelu Street, Computer Village, Lagos, Nigeria. This policy covers the website
        gadgets360.ng and the WhatsApp line we use to complete orders.
      </p>
    </section>

    <section>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details</strong> — your name, email address and profile photo when you register.</li>
        <li><strong>Order and cart data</strong> — the products you save to your cart and the order summaries you send us on WhatsApp.</li>
        <li><strong>Reviews and testimonials</strong> — anything you choose to publish on a product page.</li>
        <li><strong>Usage data</strong> — pages visited, products viewed, and the approximate country a visit came from, used only to understand demand.</li>
        <li><strong>Support conversations</strong> — messages you send through the on-site assistant or WhatsApp.</li>
      </ul>
    </section>

    <section>
      <h2>What we do with it</h2>
      <p>
        We use your data to process orders, arrange delivery or pickup, honour warranty claims, answer
        support questions and improve which products we stock. We do not sell your data, we do not rent
        our customer list, and we do not send marketing messages you did not ask for.
      </p>
    </section>

    <section>
      <h2>Who else sees it</h2>
      <ul>
        <li><strong>Our hosting and database provider</strong>, which stores your account and order records securely.</li>
        <li><strong>WhatsApp</strong>, when you choose to send us an order or enquiry through it — their own privacy terms apply to that conversation.</li>
        <li><strong>Delivery partners</strong>, who receive only the name, address and phone number needed to deliver your item.</li>
      </ul>
    </section>

    <section>
      <h2>Your rights</h2>
      <p>
        You can view and edit your profile and reviews at any time from your account page. You can also
        ask us to export or permanently delete your account data — message us on WhatsApp or email
        <a href="mailto:gadget360ng@gmail.com"> gadget360ng@gmail.com</a> and we will action it within
        30 days, in line with the Nigeria Data Protection Act.
      </p>
    </section>

    <section>
      <h2>Security and retention</h2>
      <p>
        Accounts are protected by your password and by database-level access rules that keep your cart,
        orders and profile visible only to you and to authorised staff. We keep order records for as long
        as warranty cover may apply, and account data until you ask us to delete it.
      </p>
    </section>

    <section>
      <h2>Cookies and local storage</h2>
      <p>
        We store your login session and theme preference on your own device. We use lightweight,
        first-party visit counting so we can see which products people are looking for; it is not used to
        build advertising profiles.
      </p>
    </section>
  </LegalLayout>
);

export default Privacy;
