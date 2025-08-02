import bcrypt from "bcrypt";

async function testBcrypt() {
  const password = "sara";
  const hash = "$2b$10$.OA1hXPGC4jO0WWLFPJHBeoxTMPasnajkAz2hu17I1r6J/DOqXxBe";
  console.log("Testing bcrypt.compare with password:", password);
  console.log("Stored hash:", hash);
  const isMatch = await bcrypt.compare(password, hash);
  console.log("Résultat de bcrypt.compare:", isMatch);
}

testBcrypt();
