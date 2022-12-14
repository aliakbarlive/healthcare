/* tslint:disable */
/* eslint-disable */
/**
 * Group Markets API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: v1
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {
    EnrollmentAddress,
} from './';

/**
 * 
 * @export
 * @interface EnrollmentContactInformation
 */
export interface EnrollmentContactInformation {
    /**
     * 
     * @type {string}
     * @memberof EnrollmentContactInformation
     */
    CellPhone?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnrollmentContactInformation
     */
    Email?: string | null;
    /**
     * 
     * @type {EnrollmentAddress}
     * @memberof EnrollmentContactInformation
     */
    HomeAddress?: EnrollmentAddress;
    /**
     * 
     * @type {string}
     * @memberof EnrollmentContactInformation
     */
    HomePhone?: string | null;
    /**
     * 
     * @type {EnrollmentAddress}
     * @memberof EnrollmentContactInformation
     */
    MailingAddress?: EnrollmentAddress;
    /**
     * 
     * @type {string}
     * @memberof EnrollmentContactInformation
     */
    WorkPhone?: string | null;
}

