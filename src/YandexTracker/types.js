/**
 * @typedef {{
 *   self: string;
 *   id: number;
 *   display: string;
 * }} YandexTracker.Lead
 */

/**
 * @typedef {(
 *   'DRAFT'|
 *   'IN_PROGRESS'|
 *   'LAUNCHED'|
 *   'POSTPONED'
 * )} YandexTracker.ProjectStatus
 */

/**
 * @typedef {{
 *   self: string;
 *   id: number;
 *   version: number;
 *   key: string;
 *   name: string;
 *   description: string;
 *   lead: YandexTracker.Lead;
 *   status: YandexTracker.ProjectStatus;
 *   startDate: string;
 *   endDate: string;
 * }} YandexTracker.Project
 */

/**
 * @typedef {{
 *  self: string;
 *  id: string;
 *  version: string;
 *  issue: YandexTracker.Issue;
 *  comment: string;
 *  createdBy: YandexTracker.UserBy;
 *  updatedBy: YandexTracker.UserBy;
 *  createdAt: string;
 *  updatedAt: string;
 *  start: string;
 *  duration: string;
 * }} YandexTracker.IssueWorklog
 */

/**
 * @typedef {{
 *  self: string;
 *  id: string;
 *  key: string;
 *  display: string;
 * }} YandexTracker.Issue
 */

/**
 * @typedef {{
 *  self: string;
 *  id: string;
 *  display: string;
 * }} YandexTracker.UserBy
 */
