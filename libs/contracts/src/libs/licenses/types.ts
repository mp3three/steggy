/**
 * Putting all the magic strings into buckets
 *
 * Buckets control the logic for license service
 */

/**
 * Master list of all the magic strings surrounding scopes & their descriptions
 */
export enum LicenseScopes {
  /**
   * - Title: PDF Upload
   * - Tracked: N/A
   * - Modifiers
   *   - Granted w/ pdfServer scope
   */
  pdfUpload = 'pdfUpload',
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
   *   - Hosted
   */
  form = 'form',
  /**
   * - Title: Form Loads
   * - Tracked: Per Project
   * - Modifiers
   *   - Monthly count
   *   - Hosted
   */
  formRequest = 'formRequest',
  /**
   * - Title: Emails
   * - Tracked: Per Project
   * - Modifiers
   *   - Monthly count
   *   - Hosted
   */
  email = 'email',
  /**
   * - Title: Hosted PDF Documents
   * - Tracked: Per Project
   * - Modifiers
   *   - Hosted
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
   *   - Hosted
   *   - Granted w/ pdfServer
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
   *   - Hosted
   */
  submissionRequest = 'submissionRequest',
}

/**
 * All license scopes without "Hosted" items
 *
 * 📉 stonks sorted list
 */
export enum LicenseRemoteScopes {
  accessibility = LicenseScopes.accessibility,
  apiServer = LicenseScopes.apiServer,
  pdfServer = LicenseScopes.pdfServer,
  pdfUpload = LicenseScopes.pdfUpload,
  formManager = LicenseScopes.formManager,
  project = LicenseScopes.project,
  tenant = LicenseScopes.tenant,
  dbts = LicenseScopes.dbts,
  stage = LicenseScopes.stage,
}
/**
 * Items that matter month to month
 */
export enum LicenseTrackedMonthlyScopes {
  submissionRequest = LicenseScopes.submissionRequest,
  formRequest = LicenseScopes.formRequest,
  pdfDownload = LicenseScopes.pdfDownload,
  email = LicenseScopes.email,
}
/**
 * Items tracked as a whole against the license
 */
export enum LicenseTrackedLicenseScopes {
  formManager = LicenseScopes.formManager,
  project = LicenseScopes.project,
  tenant = LicenseScopes.tenant,
  dbts = LicenseScopes.dbts,
}
/**
 * Items tracked per project
 */
export enum LicenseTrackedProjectScopes {
  submissionRequest = LicenseScopes.submissionRequest,
  formRequest = LicenseScopes.formRequest,
  pdfDownload = LicenseScopes.pdfDownload,
  stage = LicenseScopes.stage,
  email = LicenseScopes.email,
  form = LicenseScopes.form,
  pdf = LicenseScopes.pdf,
}

export enum LicenseLocations {
  /**
   * Interchangable with remote
   */
  onPremise = 'onPremise',
  remote = 'onPremise',
  hosted = 'hosted',
}
/**
 * Nominal Plan Type
 */
export enum LicensePlans {
  independent = 'independent',
  commercial = 'commercial',
  basic = 'basic',
  trial = 'trial',
  team = 'team',
}
