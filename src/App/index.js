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
  issuesToSheet(project) {
    const issues = this.yandexTracker.v2IssuesSearch({ filter: { project } });
    if (Array.isArray(issues)) {
      const values = issues.reduce((a, issue) => {
        const worklogs = this.yandexTracker.v2IssueWorklog(issue.id);
        const data = worklogs.map((w) => [issue.key, w.id, w.issue.display, new Date(w.start), w.duration]);
        if (Array.isArray(data)) a.push(...data);
        return a;
      }, []);
      if (values.length) {
        const sheetName = `Project [${project}]`;
        const sheet = this.book.getSheetByName(sheetName) || this.book.insertSheet(sheetName);
        sheet.clearContents().getRange(1, 1, values.length, values[0].length).setValues(values);
      }
    }
  }
  /**
   *
   * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
   * @param {string} issueId
   */
  sheetWorklogToIssue() {
    const sheet = this.book.getSheetByName('Обновление рабочих журналов');
    /**
     * @type {{
     *  collection: {
     *    __row: number;
     *    issueid: string;
     *    worklogid: number;
     *    start: Date;
     *    duration: string;
     *    comment: string;
     *    approve: boolean;
     *    error: string;
     *   }[]
     * }}
     */
    const data = sheet
      .getDataRange()
      .getValues()
      .reduce(
        (a, r, i) => {
          if (i === 0) {
            a.headers = r.map((v, c) => {
              return { key: String(v).toLowerCase().trim() || `col_${String(c).padStart(3, '0')}`, __col: c + 1 };
            });
            return a;
          }
          a.collection.push(
            a.headers.reduce(
              (a_, v, c) => {
                a_[v.key] = {
                  __h: v,
                  __val: r[c],
                };
                return a_;
              },
              { __row: i + 1 },
            ),
          );
          return a;
        },
        { headers: [], collection: [] },
      );

    data.collection.forEach((item) => {
      let error = '';
      if (item.approve.__val === true) {
        if (typeof item.worklogid.__val === 'number') {
          const res = this.yandexTracker.v2IssuesWorklogUpdate(item.issueid.__val, item.worklogid.__val, {
            comment: item.comment.__val || '',
            duration: item.duration.__val,
          });
          if (res.errors) error = JSON.stringify(res, null, '  ');
        } else if (item.worklogid.__val === '') {
          console.log(this.yandexTracker.toDateTimeString(item.start.__val));
          const res = this.yandexTracker.v2IssuesWorklogCreate(item.issueid.__val, {
            comment: item.comment.__val || '',
            duration: item.duration.__val,
            start: this.yandexTracker.toDateTimeString(item.start.__val),
          });
          if (res.errors) error = JSON.stringify(res, null, '  ');
          sheet.getRange(item.__row, item.worklogid.__h.__col).setValue(res.id);
        }
        sheet.getRange(item.__row, item.approve.__h.__col).setValue(false);
      }
      if (item.error.__val !== error) sheet.getRange(item.__row, item.error.__h.__col).setValue(error);
    });
  }
}

/* exported test */
function test() {
  const data = new App().yandexTracker.v2IssuesSearch({ filter: { project: '2023-seekers_accounting' } });
  console.log(data);
}

/* exported issueToSheet */
function issueToSheet() {
  const issueId = 'WORK-76';
  new App().issueToSheet(issueId);
}

/* exported issuesToSheet */
function issuesToSheet() {
  const project = '2023-seekers_accounting';
  new App().issuesToSheet(project);
}

/* exported deleteWorklog */
function deleteWorklog() {
  const issueId = 'WORK-166';
  const worklogId = '234';
  new App().yandexTracker.v2IssueWorklogDelete(issueId, worklogId);
}

/* exported printProjects */
function printProjects() {
  new App().yandexTracker.v2Projects().forEach((project) => console.log(JSON.stringify(project, null, '  ')));
}

/* exported sheetWorklogToIssue */
function sheetWorklogToIssue() {
  new App().sheetWorklogToIssue();
}
