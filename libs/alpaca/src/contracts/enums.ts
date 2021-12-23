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
