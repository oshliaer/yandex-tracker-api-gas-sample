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

  /**
   * @type {YandexTracker}
   */
  get yandexTracker() {
    if (!this._yandexTracker) {
      const { iamToken } = this.yandexIamToken;
      this._yandexTracker = new YandexTracker({
        iamToken,
        xOrgID: this.properties.YANDEX_TRACKER_X_ORG_ID,
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
}

function test() {
  new App().callApi();
}
