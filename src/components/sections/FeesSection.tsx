import { FEE_SCHEDULE } from "@/lib/pricing";

const ROWS: { category: keyof typeof FEE_SCHEDULE; appliesTo: string }[] = [
  { category: "EARLY_BIRD", appliesTo: "General delegates, registering before 25 Sep 2026" },
  { category: "REGULAR", appliesTo: "General delegates, registering after early bird closes" },
  { category: "STUDENT_EARLY_BIRD", appliesTo: "Full time students, valid ID required, before 25 Sep 2026" },
  { category: "STUDENT_REGULAR", appliesTo: "Full time students, valid ID required, after early bird closes" },
  { category: "INTERNATIONAL", appliesTo: "Delegates registering from outside Nigeria" },
];

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount}` : `₦${amount.toLocaleString("en-NG")}`;
}

export function FeesSection() {
  return (
    <section id="fees">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">IV. Registration Fees</div>
          <h2>Conference fee schedule</h2>
          <p>
            Fees cover conference materials, session access and meals during sessions. Payment is made
            through the University of Lagos Remita portal and settled at any commercial bank; the
            registration form works out what you owe and gives you the exact figures to enter.
          </p>
        </div>
        <div className="table-scroll">
          <table className="fee-table">
            <thead>
              <tr><th>Category</th><th>Applies to</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const fee = FEE_SCHEDULE[row.category];
                return (
                  <tr key={row.category}>
                    <td>{fee.label}</td>
                    <td>{row.appliesTo}</td>
                    <td className="amount tnum">{formatAmount(fee.amount, fee.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
