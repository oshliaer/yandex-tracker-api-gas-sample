/* exported YandexTracker */
class YandexTracker {
  constructor({ iamToken, oauthToken, xOrgID }) {
    this.iamToken = iamToken;
    this.oauthToken = oauthToken;
    this.xOrgID = xOrgID;
  }

  get headers() {
    if (!this._headers) {
      this._headers = {
        // Host: 'https://api.tracker.yandex.net',
        'X-Org-ID': this.xOrgID,
        Authorization: 'not provided',
        'Content-Type': 'application/json',
      };
      if (this.iamToken) this._headers.Authorization = `Bearer ${this.iamToken}`;
      else if (this._oauthToken) this._headers.Authorization = `OAuth ${this._oauthToken}`;
    }
    return this._headers;
  }

  /**
   *
   * @returns {YandexTracker.Project[]}
   */
  v2Projects() {
    console.log(this.headers);
    const httpResponse = UrlFetchApp.fetch('https://api.tracker.yandex.net/v2/projects', {
      method: 'get',
      muteHttpExceptions: true,
      headers: this.headers,
      contentType: 'application/json',
    });
    return JSON.parse(httpResponse.getContentText());
  }
}

/*

Host: https://api.tracker.yandex.net

Authorization: OAuth <ваш OAuth-токен> — при доступе по протоколу OAuth 2.0.

Authorization: Bearer <ваш IAM-TOKEN> — при доступе по IAM-токену.

X-Org-ID: <идентификатор организации>

*/
