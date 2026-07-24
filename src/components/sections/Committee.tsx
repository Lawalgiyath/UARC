const ROLES = [
  "Conference Chair",
  "Vice Chair",
  "Secretary",
  "Treasurer",
  "Scientific Review Lead",
  "Publications Liaison",
  "Logistics and Venue",
  "Sponsorship and Protocol",
];

export function Committee() {
  return (
    <section id="committee">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">VIII. Organising Committee</div>
          <h2>Who to contact</h2>
          <p>Names to be supplied by the Local Organising Committee. Roles are fixed so delegates always know who handles what.</p>
        </div>
        <div className="committee-grid">
          {ROLES.map((role) => (
            <div className="committee-card" key={role}>
              <div className="role">{role}</div>
              <div className="slot">{role === "Publications Liaison" ? "Unilag Journals" : "Name to be announced"}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
