import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

// A bcrypt hash is built out of $ separated fields: $2a$12$<salt><digest>.
// Next.js loads .env through dotenv-expand, which reads $2a, $12 and the
// leading run of the salt as variable references and substitutes them with
// nothing. The hash silently arrives 20-odd characters short, bcrypt.compare
// returns false for every password, and the only symptom is "Incorrect email
// or password" on a correct one. Escaping each $ is what stops it; quoting,
// single or double, does not.
const escaped = hash.replace(/\$/g, "\\$");

console.log("\nADMIN_PASSWORD_HASH=\"" + escaped + "\"\n");
console.log("Paste the line above into your .env file, backslashes and all.");
console.log("The plain password is not stored anywhere.\n");
console.log("Setting this in a hosting dashboard instead (Vercel, Netlify)?");
console.log("Those take the raw value, with no escaping, so paste this:\n");
console.log("  " + hash + "\n");
