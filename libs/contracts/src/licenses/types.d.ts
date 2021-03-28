// Keeping track of all the magic strings

export enum OnPremiseScopes {
  apiServer = 'apiServer',
  pdfServer = 'pdfServer',
  project = 'project',
  tenant = 'tenant',
  stage = 'stage',
  formManager = 'formManager',
  accessibility = 'accessibility',
}
export enum LicensePlans {
  basic = 'basic',
  independent = 'independent',
  team = 'team',
  commercial = 'commercial',
  trial = 'trial',
}
export enum LicenseScopes {
  // On Premise
  apiServer = 'apiServer',
  pdfServer = 'pdfServer',
  project = 'project',
  tenant = 'tenant',
  stage = 'stage',
  livestage = 'livestage',
  accessibility = 'accessibility',
  formManager = 'formManager',
  // Hosted / Monthly
  form = 'form',
  formRequest = 'formRequest',
  email = 'email',
  pdf = 'pdf',
  pdfDownload = 'pdfDownload',
  vpat = 'vpat',
  submissionRequest = 'submissionRequest',
}
export enum LicenseLocations {
  onPremise = 'onPremise',
  hosted = 'hosted',
}
