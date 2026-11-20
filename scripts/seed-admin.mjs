import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

async function main() {
  const uri = process.env.MONGODB_URI
  const email = (process.env.ADMIN_EMAIL || 'divyanshu1300@gmail.com').toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'Div@123@456#'

  if (!uri) throw new Error('MONGODB_URI missing')

  await mongoose.connect(uri)
  const passwordHash = await bcrypt.hash(password, 10)
  await User.findOneAndUpdate(
    { email },
    { email, passwordHash, role: 'admin' },
    { upsert: true, new: true },
  )
  console.log(`Admin seeded/updated: ${email}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
