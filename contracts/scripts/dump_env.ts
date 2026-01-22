import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.PRIVATE_KEY;
console.log(`Address from config: ${key ? "FOUND" : "MISSING"}`);
if (key) {
    fs.writeFileSync('active_key.txt', key);
}
