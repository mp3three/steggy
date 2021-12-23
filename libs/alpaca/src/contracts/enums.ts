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
