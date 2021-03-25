import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // #region Public Methods

  public clearLicense(id: string) {
    return id;
  }

  public getAdminInfo(id: string) {
    return id;
  }

  public getScope(key: string) {
    return key;
  }

  public getTerms(id: string) {
    return id;
  }

  public getUtilizations(id: string, type: string) {
    return id;
  }

  public loadLicenses() {}

  public loadLicensesAdmin() {}

  public utilizationDelete() {}

  public utilizationDisable() {}

  public utilizationEnable() {}

  public utilizationFetch() {}

  // #endregion Public Methods
}
