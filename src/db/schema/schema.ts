import { relations } from 'drizzle-orm';
import {
  pgTable,
  text,
  real,
  integer,
  timestamp,
  serial,
  bigint,
  boolean,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';

export const pairsPrices = pgTable(
  'pairs_prices',
  {
    exchange: text('exchange').notNull(),
    symbol: text('symbol').notNull(),
    price: real('price').notNull(),
    timestamp: timestamp('timestamp', {
      mode: 'string',
      precision: 2,
      withTimezone: true
    }).notNull(),
    createdAt: timestamp('created_at', {
      mode: 'string',
      precision: 2,
      withTimezone: true
    }).defaultNow()
  },
  table => ({
    idxPairsPricesTimestampSymbolExchange: index(
      'idx_pairs_prices_exchange_symbol_timestamp'
    ).on(table.exchange, table.symbol, table.timestamp.desc())
  })
);

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  isEnabled: boolean('is_enabled').notNull().default(true)
});

export const userPeriodChanges = pgTable(
  'user_period_changes',
  {
    id: serial('id').primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    period: integer('period').notNull(),
    change: real('change').notNull()
  },
  table => ({
    uniqueUserExchange: uniqueIndex('unique_user_period_changes').on(
      table.userId,
      table.period,
      table.change
    )
  })
);

export const exchanges = pgTable('exchanges', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique()
});

export const usersExchanges = pgTable(
  'user_exchanges',
  {
    id: serial('id').primaryKey(),
    userId: bigint('user_id', { mode: 'number' })
      .notNull()
      .references(() => users.id, { onUpdate: 'cascade', onDelete: 'cascade' }),
    exchangeName: text('exchange_name')
      .notNull()
      .references(() => exchanges.name, {
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }),
    enabled: boolean('enabled').notNull().default(true)
  },
  table => ({
    pkUserExchanges: index('pk_user_exchanges').on(
      table.userId,
      table.exchangeName
    ),
    uniqueUserExchange: uniqueIndex('unique_user_exchange').on(
      table.userId,
      table.exchangeName
    )
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  userExchanges: many(usersExchanges),
  userPeriodChanges: many(userPeriodChanges)
}));

export const exchangesRelations = relations(exchanges, ({ many }) => ({
  userExchanges: many(usersExchanges)
}));

export const usersExchangesRelations = relations(usersExchanges, ({ one }) => ({
  user: one(users, { fields: [usersExchanges.userId], references: [users.id] }),
  exchange: one(exchanges, {
    fields: [usersExchanges.exchangeName],
    references: [exchanges.name]
  })
}));

export const userPeriodChangesRelations = relations(
  userPeriodChanges,
  ({ one }) => ({
    user: one(users, {
      fields: [userPeriodChanges.userId],
      references: [users.id]
    })
  })
);
