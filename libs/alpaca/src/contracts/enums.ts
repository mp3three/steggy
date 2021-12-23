/**
 * The following are the possible account status values. Most likely, the account status
 * is ACTIVE unless there is any problem. The account status may get in ACCOUNT_UPDATED
 * when personal information is being updated from the dashboard, in which case you may
 * not be allowed trading for a short period of time until the change is approved.
 */
export enum AccountStatus {
  /**
   * The account is onboarding.
   */
  ONBOARDING = 'ONBOARDING',
  /**
   * The account application submission failed for some reason.
   */
  SUBMISSION_FAILED = 'SUBMISSION_FAILED',
  /**
   * The account application has been submitted for review.
   */
  SUBMITTED = 'SUBMITTED',
  /**
   * The account information is being updated.
   */
  ACCOUNT_UPDATED = 'ACCOUNT_UPDATED',
  /**
   * The final account approval is pending.
   */
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  /**
   * The account is active for trading.
   */
  ACTIVE = 'ACTIVE',
  /**
   * The account application has been rejected.
   */
  REJECTED = 'REJECTED',
}

export enum ActivityType {
  /**
   * Order fills (both partial and full fills)
   */
  FILL = 'FILL',

  /**
   * Cash transactions (both CSD and CSR)
   */
  TRANS = 'TRANS',

  /**
   * Miscellaneous or rarely used activity types (All types except those in TRANS, DIV,
   * or FILL)
   */
  MISC = 'MISC',

  /**
   * ACATS IN/OUT (Cash)
   */
  ACATC = 'ACATC',

  /**
   * ACATS IN/OUT (Securities)
   */
  ACATS = 'ACATS',

  /**
   * Cash disbursement(+)
   */
  CSD = 'CSD',

  /**
   * Cash receipt(-)
   */
  CSR = 'CSR',

  /**
   * Dividends
   */
  DIV = 'DIV',

  /**
   * Dividend (capital gain long term)
   */
  DIVCGL = 'DIVCGL',

  /**
   * Dividend (capital gain short term)
   */
  DIVCGS = 'DIVCGS',

  /**
   * Dividend fee
   */
  DIVFEE = 'DIVFEE',

  /**
   * Dividend adjusted (Foreign Tax Withheld)
   */
  DIVFT = 'DIVFT',

  /**
   * Dividend adjusted (NRA Withheld)
   */
  DIVNRA = 'DIVNRA',

  /**
   * Dividend return of capital
   */
  DIVROC = 'DIVROC',

  /**
   * Dividend adjusted (Tefra Withheld)
   */
  DIVTW = 'DIVTW',

  /**
   * Dividend (tax exempt)
   */
  DIVTXEX = 'DIVTXEX',

  /**
   * Interest (credit/margin)
   */
  INT = 'INT',

  /**
   * Interest adjusted (NRA Withheld)
   */
  INTNRA = 'INTNRA',

  /**
   * Interest adjusted (Tefra Withheld)
   */
  INTTW = 'INTTW',

  /**
   * Journal entry
   */
  JNL = 'JNL',

  /**
   * Journal entry (cash)
   */
  JNLC = 'JNLC',

  /**
   * Journal entry (stock)
   */
  JNLS = 'JNLS',

  /**
   * Merger/Acquisition
   */
  MA = 'MA',

  /**
   * Name change
   */
  NC = 'NC',

  /**
   * Option assignment
   */
  OPASN = 'OPASN',

  /**
   * Option expiration
   */
  OPEXP = 'OPEXP',

  /**
   * Option exercise
   */
  OPXRC = 'OPXRC',

  /**
   * Pass Thru Charge
   */
  PTC = 'PTC',

  /**
   * Pass Thru Rebate
   */
  PTR = 'PTR',

  /**
   * Reorg CA
   */
  REORG = 'REORG',

  /**
   * Symbol change
   */
  SC = 'SC',

  /**
   * Stock spinoff
   */
  SSO = 'SSO',

  /**
   * Stock split
   */
  SSP = 'SSP',
}

export enum AssetExchange {
  AMEX = 'AMEX',
  ARCA = 'ARCA',
  BATS = 'BATS',
  NYSE = 'NYSE',
  NASDAQ = 'NASDAQ',
  NYSEARCA = 'NYSEARCA',
}

export enum AssetStatus {
  active = 'active',
  inactive = 'inactive',
}

export enum DataSource {
  iex = 'iex',
  sip = 'sip',
}

export enum OrderType {
  market = 'market',
  limit = 'limit',
  stop = 'stop',
  stop_limit = 'stop_limit',
  trailing_stop = 'trailing_stop',
}

export enum OrderClass {
  simple = 'simple',
  bracket = 'bracket',
  oto = 'oto',
  oco = 'oco',
}

export enum OrderSide {
  buy = 'buy',
  sell = 'sell',
}

export enum OrderTimeInForce {
  /**
   * A day order is eligible for execution only on the day it is live. By default, the
   * order is only valid during Regular Trading Hours (9:30am - 4:00pm ET). If unfilled
   * after the closing auction, it is automatically canceled. If submitted after the
   * close, it is queued and submitted the following trading day. However, if marked as
   * eligible for extended hours, the order can also execute during supported extended
   * hours.
   */
  day = 'day',

  /**
   * The order is good until canceled. Non-marketable GTC limit orders are subject to
   * price adjustments to offset corporate actions affecting the issue. We do not
   * currently support Do Not Reduce(DNR) orders to opt out of such price adjustments.
   */
  gtc = 'gtc',

  /**
   * Use this TIF with a market/limit order type to submit "market on open" (MOO) and
   * "limit on open" (LOO) orders. This order is eligible to execute only in the market
   * opening auction. Any unfilled orders after the open will be cancelled. OPG orders
   * submitted after 9:28am but before 7:00pm ET will be rejected. OPG orders submitted
   * after 7:00pm will be queued and routed to the following day's opening auction. On
   * open/on close orders are routed to the primary exchange. Such orders do not
   * necessarily execute exactly at 9:30am / 4:00pm ET but execute per the exchange's
   * auction rules.
   */
  opg = 'opg',

  /**
   * Use this TIF with a market/limit order type to submit "market on close" (MOC) and
   * "limit on close" (LOC) orders. This order is eligible to execute only in the market
   * closing auction. Any unfilled orders after the close will be cancelled. CLS orders
   * submitted after 3:50pm but before 7:00pm ET will be rejected. CLS orders submitted
   * after 7:00pm will be queued and routed to the following day's closing auction. Only
   * available with API v2.
   */
  cls = 'cls',

  /**
   * An Immediate Or Cancel (IOC) order requires all or part of the order to be executed
   * immediately. Any unfilled portion of the order is canceled. Only available with API
   * v2.
   */
  ioc = 'ioc',

  /**
   * A Fill or Kill (FOK) order is only executed if the entire order quantity can be
   * filled, otherwise the order is canceled. Only available with API v2.
   */
  fok = 'fok',
}

export enum PositionSide {
  long = 'long',
  short = 'short',
}

export enum OrderStatus {
  /**
   * The order has been received by Alpaca, and routed to exchanges for execution. This
   * is the usual initial state of an order.
   */
  new = 'new',

  /**
   * The order has been partially filled.
   */
  partially_filled = 'partially_filled',

  /**
   * The order has been filled, and no further updates will occur for the order.
   */
  filled = 'filled',

  /**
   * The order is done executing for the day, and will not receive further updates until
   * the next trading day.
   */
  done_for_day = 'done_for_day',

  /**
   * The order has been canceled, and no further updates will occur for the order. This
   * can be either due to a cancel request by the user, or the order has been canceled by
   * the exchanges due to its time-in-force.
   */
  canceled = 'canceled',

  /**
   * The order has expired, and no further updates will occur for the order.
   */
  expired = 'expired',

  /**
   * The order was replaced by another order, or was updated due to a market event such
   * as corporate action.
   */
  replaced = 'replaced',

  /**
   * The order is waiting to be canceled.
   */
  pending_cancel = 'pending_cancel',

  /**
   * The order is waiting to be replaced by another order. The order will reject cancel
   * request while in this state.
   */
  pending_replace = 'pending_replace',

  /**
   * (Uncommon) The order has been received by Alpaca, but hasn't yet been routed to the
   * execution venue. This could be seen often out side of trading session hours.
   */
  accepted = 'accepted',

  /**
   * (Uncommon) The order has been received by Alpaca, and routed to the exchanges, but
   * has not yet been accepted for execution. This state only occurs on rare occasions.
   */
  pending_new = 'pending_new',

  /**
   * (Uncommon) The order has been received by exchanges, and is evaluated for pricing.
   * This state only occurs on rare occasions.
   */
  accepted_for_bidding = 'accepted_for_bidding',

  /**
   * (Uncommon) The order has been stopped, and a trade is guaranteed for the order,
   * usually at a stated price or better, but has not yet occurred. This state only
   * occurs on rare occasions.
   */
  stopped = 'stopped',

  /**
   * (Uncommon) The order has been rejected, and no further updates will occur for the
   * order. This state occurs on rare occasions and may occur based on various conditions
   * decided by the exchanges.
   */
  rejected = 'rejected',

  /**
   * (Uncommon) The order has been suspended, and is not eligible for trading. This state
   * only occurs on rare occasions.
   */
  suspended = 'suspended',

  /**
   * (Uncommon) The order has been completed for the day (either filled or done for day),
   * but remaining settlement calculations are still pending. This state only occurs on
   * rare occasions.
   */
  calculated = 'calculated',
}
