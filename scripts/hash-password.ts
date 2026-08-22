import "./load-env";
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
console.log("Setting this on Vercel? Escape it there too, exactly the same way.");
console.log("Vercel expands $NAME in an environment variable just as a .env file does,");
console.log("so a raw hash arrives with $2a$12$X eaten off the front and every sign in");
console.log('fails with "Incorrect email or password" while the value still looks');
console.log("correct in the dashboard. Paste the escaped line above.\n");
console.log("For a host that genuinely takes raw values, the unescaped hash is:\n");
console.log("  " + hash + "\n");
