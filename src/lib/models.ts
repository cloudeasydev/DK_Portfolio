import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
  },
  { timestamps: true },
)

const profileSchema = new Schema(
  {
    name: String,
    given: String,
    family: String,
    pronouns: String,
    role: String,
    organization: String,
    organizationUrl: String,
    avatar: String,
    resumeUrl: String,
    email: String,
    bio: String,
    about: String,
    links: [{ label: String, url: String, icon: String }],
    interests: [String],
    education: [
      {
        degree: String,
        institution: String,
        start: String,
        end: String,
        summary: String,
      },
    ],
    experience: [
      {
        role: String,
        org: String,
        start: String,
        end: String,
        summary: String,
      },
    ],
    skills: [
      {
        name: String,
        items: [{ label: String, level: Number }],
      },
    ],
    languages: [{ name: String, level: Number, label: String }],
    awards: [
      {
        title: String,
        awarder: String,
        date: String,
        summary: String,
      },
    ],
    certifications: [{ name: String, issuer: String, year: String }],
  },
  { timestamps: true },
)

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    content: { type: String, default: '' },
    venue: { type: String, default: '' },
    date: { type: String, default: '' },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    links: [{ label: String, url: String }],
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true },
)

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    tags: [{ type: String }],
    url: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    date: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true },
)

const mediaSchema = new Schema(
  {
    filename: String,
    contentType: String,
    size: Number,
    data: Buffer,
  },
  { timestamps: true },
)

const otpChallengeSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true },
)

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId }
export type ProfileDoc = InferSchemaType<typeof profileSchema> & { _id: mongoose.Types.ObjectId }
export type BlogDoc = InferSchemaType<typeof blogSchema> & { _id: mongoose.Types.ObjectId }
export type ProjectDoc = InferSchemaType<typeof projectSchema> & { _id: mongoose.Types.ObjectId }
export type MediaDoc = InferSchemaType<typeof mediaSchema> & { _id: mongoose.Types.ObjectId }
export type OtpChallengeDoc = InferSchemaType<typeof otpChallengeSchema> & {
  _id: mongoose.Types.ObjectId
  createdAt: Date
}

export const User: Model<UserDoc> =
  mongoose.models.User || mongoose.model<UserDoc>('User', userSchema)
export const Profile: Model<ProfileDoc> =
  mongoose.models.Profile || mongoose.model<ProfileDoc>('Profile', profileSchema)
export const Blog: Model<BlogDoc> =
  mongoose.models.Blog || mongoose.model<BlogDoc>('Blog', blogSchema)
export const Project: Model<ProjectDoc> =
  mongoose.models.Project || mongoose.model<ProjectDoc>('Project', projectSchema)
export const Media: Model<MediaDoc> =
  mongoose.models.Media || mongoose.model<MediaDoc>('Media', mediaSchema)
export const OtpChallenge: Model<OtpChallengeDoc> =
  mongoose.models.OtpChallenge ||
  mongoose.model<OtpChallengeDoc>('OtpChallenge', otpChallengeSchema)
