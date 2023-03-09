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
