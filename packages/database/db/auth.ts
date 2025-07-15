import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const userRoleEnums = pgEnum('Role', ['user', 'admin', 'superAdmin']);

export const user = pgTable('user', {
  banExpires: timestamp('ban_expires'),
  banned: boolean('banned'),
  banReason: text('ban_reason'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified')
    .$defaultFn(() => false)
    .notNull(),
  id: text('id').primaryKey(),
  image: text('image'),
  name: text('name').notNull(),
  normalizedEmail: text('normalized_email').unique(),
  role: userRoleEnums('role').default('user').notNull(),
  twoFactorEnabled: boolean('two_factor_enabled'),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable('session', {
  activeOrganizationId: text('active_organization_id'),
  createdAt: timestamp('created_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  id: text('id').primaryKey(),
  impersonatedBy: text('impersonated_by'),
  ipAddress: text('ip_address'),
  token: text('token').notNull().unique(),
  updatedAt: timestamp('updated_at').notNull(),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  accessToken: text('access_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  accountId: text('account_id').notNull(),
  createdAt: timestamp('created_at').notNull(),
  id: text('id').primaryKey(),
  idToken: text('id_token'),
  password: text('password'),
  providerId: text('provider_id').notNull(),
  refreshToken: text('refresh_token'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  updatedAt: timestamp('updated_at').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const verification = pgTable('verification', {
  createdAt: timestamp('created_at').$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  expiresAt: timestamp('expires_at').notNull(),
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  updatedAt: timestamp('updated_at').$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  value: text('value').notNull(),
});

export const passkey = pgTable('passkey', {
  aaguid: text('aaguid'),
  backedUp: boolean('backed_up').notNull(),
  counter: integer('counter').notNull(),
  createdAt: timestamp('created_at'),
  credentialID: text('credential_i_d').notNull(),
  deviceType: text('device_type').notNull(),
  id: text('id').primaryKey(),
  name: text('name'),
  publicKey: text('public_key').notNull(),
  transports: text('transports'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const twoFactor = pgTable('two_factor', {
  backupCodes: text('backup_codes').notNull(),
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const organization = pgTable('organization', {
  createdAt: timestamp('created_at').notNull(),
  id: text('id').primaryKey(),
  logo: text('logo'),
  metadata: text('metadata'),
  name: text('name').notNull(),
  slug: text('slug').unique(),
});

export const member = pgTable('member', {
  createdAt: timestamp('created_at').notNull(),
  id: text('id').primaryKey(),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  role: userRoleEnums('role').default('user').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const invitation = pgTable('invitation', {
  email: text('email').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  id: text('id').primaryKey(),
  inviterId: text('inviter_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  role: userRoleEnums('role'),
  status: text('status').default('pending').notNull(),
});

export const jwks = pgTable('jwks', {
  createdAt: timestamp('created_at').notNull(),
  id: text('id').primaryKey(),
  privateKey: text('private_key').notNull(),
  publicKey: text('public_key').notNull(),
});

export type User = InferSelectModel<typeof user>;
