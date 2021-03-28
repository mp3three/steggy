/**
 * Putting all the magic strings into buckets
 *
 * Buckets serve as control logic also
 */

export enum LicenseScopes {
  /**
   * - Title: API Environments
   *   - AKA: Unique database environmentIds
   * - Tracked: Per License
   */
  apiServer = 'apiServer',
  /**
   * - Title: PDF Server
   * - Tracked: Per License
   */
  pdfServer = 'pdfServer',
  /**
   * - Title: Projects
   * - Tracked: Per License
   */
  project = 'project',
  /**
   * - Title: Form Building Tenants
   * - Tracked: Per License
   */
  tenant = 'tenant',
  /**
   * Synonymous with livestage, here for legacy reasons
   */
  stage = 'stage',
  /**
   * - Title: Additional Live Stages
   * - Tracked: Per Project
   */
  livestage = 'livestage',
  /**
   * Accessibility
   *
   * ? How does this work? What is it? What sets it?
   * ! I'm Not seeing anything on the manager UI
   */
  accessibility = 'accessibility',
  /**
   * - Title: Form Manager Projects
   * - Tracked: Per License
   */
  formManager = 'formManager',
  /**
   * - Title: Forms
   * - Tracked: Per Project
   * - Modifiers
   *   - Monthly count
   *   - Hosted Only
   */
  form = 'form',
  /**
   * - Title: Form Loads
   * - Tracked: Per Project
   * - Modifiers
   *   - Monthly count
   *   - Hosted Only
   */
  formRequest = 'formRequest',
  /**
   * - Title: Emails
   * - Tracked: Per Project
   * - Modifiers
   *   - Monthly count
   *   - Hosted Only
   */
  email = 'email',
  /**
   * - Title: Hosted PDF Documents
   * - Tracked: Per Project
   * - Modifiers
   *   - Hosted Only
   */
  pdf = 'pdf',
  /**
   * - Title: Database Tenants
   * - Tracked: Per License
   */
  dbts = 'dbts',
  /**
   * - Title: PDF Generations
   * - Tracked: Per Project
   * - Modifiers
   *   - Monthly count
   *   - Hosted Only
   */
  pdfDownload = 'pdfDownload',
  /**
   * - Title: ?
   * - Tracked: Per License
   * - Modifiers
   *   - Is a flag
   */
  vpat = 'vpat',
  /**
   * - Title: Submission Request
   * - Tracked: Per Project
   * - Modifiers
   *   - Monthly count
   *   - Hosted Only
   */
  submissionRequest = 'submissionRequest',
}

/**
 * All license scopes without "hosted only" items
 */
export enum LicenseRemoteScopes {
  apiServer = LicenseScopes.apiServer,
  pdfServer = LicenseScopes.pdfServer,
  project = LicenseScopes.project,
  tenant = LicenseScopes.tenant,
  livestage = LicenseScopes.livestage,
  stage = LicenseScopes.stage,
  dbts = LicenseScopes.dbts,
  formManager = LicenseScopes.formManager,
  accessibility = LicenseScopes.accessibility,
}
/**
 * Items that matter month to month
 */
export enum LicenseTrackedMonthlyScopes {
  formRequest = LicenseScopes.formRequest,
  email = LicenseScopes.email,
  pdfDownload = LicenseScopes.pdfDownload,
  submissionRequest = LicenseScopes.submissionRequest,
}
/**
 * Items tracked as a whole against the license
 */
export enum LicenseTrackedLicenseScopes {
  project = LicenseScopes.project,
  tenant = LicenseScopes.tenant,
  dbts = LicenseScopes.dbts,
  formManager = LicenseScopes.formManager,
}
/**
 * Items that are tracked per project
 */
export enum LicenseTrackedProjectScopes {
  livestage = LicenseScopes.livestage,
  stage = LicenseScopes.stage,
  form = LicenseScopes.form,
  formRequest = LicenseScopes.formRequest,
  email = LicenseScopes.email,
  pdfDownload = LicenseScopes.pdfDownload,
  submissionRequest = LicenseScopes.submissionRequest,
  pdf = LicenseScopes.pdf,
}

export enum LicenseLocations {
  /**
   * Interchangable with onPremise
   */
  remote = 'onPremise',
  onPremise = 'onPremise',
  hosted = 'hosted',
}

export enum LicensePlans {
  basic = 'basic',
  independent = 'independent',
  team = 'team',
  commercial = 'commercial',
  trial = 'trial',
}
