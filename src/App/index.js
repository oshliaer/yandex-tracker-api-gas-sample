/* global YandexTracker */

/* exported App */
class App {
  constructor() {}
  /**
   * @type {App.Properties}
   */
  get properties() {
    if (!this._properties) this._properties = PropertiesService.getScriptProperties().getProperties();
    return this._properties;
  }

  get book() {
    if (!this._book) this._book = SpreadsheetApp.openById(this.properties.APP_BOOK_ID);
    return this._book;
  }

  /**
   * @type {YandexTracker}
   */
  get yandexTracker() {
    if (!this._yandexTracker) {
      const { iamToken } = this.yandexIamToken;
      this._yandexTracker = new YandexTracker({
        iamToken,
        // xOrgID: this.properties.YANDEX_TRACKER_X_ORG_ID,
        xCloudOrgId: this.properties.YANDEX_TRACKER_X_CLOUD_ORG_ID,
      });
    }
    return this._yandexTracker;
  }

  /**
   * @type {App.IamToken}
   */
  get yandexIamToken() {
    console.warn('get yandex iam token');
    if (!this._yandexIamToken) {
      console.warn('No yandex iam token. Try ca');
      const iamTokenCache = CacheService.getScriptCache().get('YANDEX_TRACKER_IAM_TOKEN');
      this._yandexIamToken = iamTokenCache ? JSON.parse(iamTokenCache) : { iamToken: '', expiresAt: '0' };
    }
    if (new Date(this._yandexIamToken.expiresAt).getTime() - new Date().getTime() < 1000 * 60 * 5) {
      console.warn('expiries at');
      const url = 'https://iam.api.cloud.yandex.net/iam/v1/tokens';
      const httpResponse = UrlFetchApp.fetch(url, {
        method: 'post',
        muteHttpExceptions: true,
        contentType: 'application/json',
        payload: JSON.stringify({
          yandexPassportOauthToken: this.properties.YANDEX_TRACKER_OAUTH_IAM_TOKEN,
        }),
      });
      this._yandexIamToken = JSON.parse(httpResponse.getContentText());
      CacheService.getScriptCache().put('YANDEX_TRACKER_IAM_TOKEN', JSON.stringify(this._yandexIamToken), 21600);
    }
    return this._yandexIamToken;
  }

  callApi() {
    console.log(this.yandexIamToken);
    const projects = this.yandexTracker.v2Projects();
    projects.forEach((project) => {
      console.log(project.name);
    });
  }

  issueToSheet(issueId) {
    const data = this.yandexTracker.v2IssueWorklog(issueId);
    const values = data.map((w) => [w.id, w.issue.display, new Date(w.start), w.duration]);
    if (values.length) {
      const sheetName = `IssueWorklog [${issueId}]`;
      const sheet = this.book.getSheetByName(sheetName) || this.book.insertSheet(sheetName);
      sheet.clearContents().getRange(1, 1, values.length, values[0].length).setValues(values);
    }
  }
}

/* exported test */
function test() {
  new App().callApi();
}

/* exported issueToSheet */
function issueToSheet() {
  const issueId = 'WORK-76';
  new App().issueToSheet(issueId);
}

/* exported deleteWorklog */
function deleteWorklog() {
  const issueId = 'WORK-166';
  const worklogId = '234';
  new App().yandexTracker.v2IssueWorklogDelete(issueId, worklogId);
}
