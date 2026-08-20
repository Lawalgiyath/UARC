import { CONFERENCE, CONTACT } from "@/lib/conference";

const ITEMS = [
  {
    q: "What format should my abstract follow?",
    a: "Between 300 and 500 words, structured under Background, Methods, Results and Conclusion, submitted through the portal. You may attach a full manuscript as a Word or PDF file at the same time, but it is optional at the abstract stage.",
  },
  {
    q: "Will accepted abstracts be published?",
    a: "Abstracts accepted for oral presentation are considered for publication in the UNILAG Journal of Humanities (UJH) or the UNILAG Journal of Medicine, Science and Technology (UJMST), subject to each journal's own peer review. Presenting does not transfer copyright: the work stays yours.",
  },
  {
    q: "How do I track my submission status?",
    a: "Use the tracker on the submission page with the reference code emailed and texted to you when you submitted. You need both the code and the email address you used, so nobody else can look up your abstract.",
  },
  {
    q: "How do I actually pay?",
    a: "Through Remita, on the University of Lagos payment portal. Register on this site first: it works out what you owe, reserves your place and gives you a reference. Then go to unilag.edu.ng, open the Unilag payment portal, choose the customer category \"Others\", pick \"Research Conference Fair\" as the payment item, and enter the amount shown. Print the slip, pay it at any commercial bank, then come back to the payment page with your RRR and a photograph of the receipt.",
  },
  {
    q: "Why can I not just pay by card on the site?",
    a: "Because the university collects conference fees through Remita, and a payment made any other way cannot be reconciled against the conference account. What the site does instead is remove the guesswork around it: the amount, the payment item and your reference are all worked out for you, and the receipt goes straight to the Secretariat rather than into an inbox.",
  },
  {
    q: "How long until my payment is confirmed?",
    a: "Normally within two working days of the receipt reaching us. Your place is held from the moment you send it, and you are told by email and SMS once it is confirmed. If a receipt cannot be accepted you are told exactly why, and your place is still held while you sort it out.",
  },
  {
    q: "How is the student rate checked?",
    a: "Student registrations ask for a matriculation or student number and an institutional email address. Addresses on recognised academic domains clear immediately; anything else is reviewed by the Secretariat, usually within two working days, and you can still pay straight away. Bring your student ID card to the registration desk.",
  },
  {
    q: "When do I get my certificate?",
    a: "As soon as you are checked in at the registration desk. The certificate is generated automatically, a link is emailed to you, and you can find it again at any time on the certificates page using your email address and reference. Every certificate carries a code anyone can verify on this site.",
  },
  {
    q: "Can international presenters get a letter of invitation?",
    a: "Yes. Once registration and payment are confirmed, email the Secretariat with your registration reference, passport details and travel dates. Allow at least six weeks before you intend to travel.",
  },
  {
    q: "Does the conference arrange accommodation?",
    a: "No, delegates book their own. The accommodation page lists the guest house on the Akoka campus and hotels nearby, with guidance on airport transfers and how much time to allow for Lagos traffic.",
  },
  {
    q: "How does my organisation sponsor or exhibit?",
    a: "The sponsorship page sets out five tiers and the exhibition page lists stand types with live availability. Both can be paid online or settled against an invoice through your finance office.",
  },
  {
    q: "What is the refund policy?",
    a: "Registration fees are non refundable after 6 October 2026, but are fully transferable to another delegate from the same institution at no charge. Write to the Secretariat with both names and the original reference.",
  },
  {
    q: "Is this edition in person?",
    a: `Yes, all sessions run in person at the ${CONFERENCE.venue}. Contact the Secretariat directly if you require accessibility arrangements, and we will make them.`,
  },
];

export function Faq() {
  return (
    <section id="faq">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">IX. Questions</div>
          <h2>Frequently asked</h2>
          <p>
            If your question is not here, the Secretariat answers email within two working days at{" "}
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
          </p>
        </div>
        <div>
          {ITEMS.map((item, i) => (
            <details className="faq-item" key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <div className="a">{item.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
