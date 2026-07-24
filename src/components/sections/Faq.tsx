const ITEMS = [
  {
    q: "What format should my abstract follow?",
    a: "Between 300 and 500 words, structured under Background, Methods, Results and Conclusion, submitted as a Word or PDF document through the portal above.",
  },
  {
    q: "Will accepted abstracts be published?",
    a: "Abstracts accepted for oral or poster presentation will be considered for publication in the University of Lagos Journals, subject to that journal's own peer review process.",
  },
  {
    q: "Can international presenters get a letter of invitation?",
    a: "Yes. Once registration and payment are confirmed, an invitation letter for visa purposes can be requested from the Secretariat by email.",
  },
  {
    q: "What is the refund policy?",
    a: "Registration fees are non refundable after 6 October 2026, but are fully transferable to another delegate from the same institution at no charge.",
  },
  {
    q: "Is this edition in person?",
    a: "Yes, all sessions run in person at the Jelili Adebisi Omotola Hall. Contact the Secretariat directly if you require special accommodation.",
  },
  {
    q: "How do I track my submission status?",
    a: "Use the reference code emailed and texted to you at the time of submission in the tracker beneath the abstract portal, or contact the Secretariat directly.",
  },
];

export function Faq() {
  return (
    <section id="faq">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">IX. Questions</div>
          <h2>Frequently asked</h2>
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
