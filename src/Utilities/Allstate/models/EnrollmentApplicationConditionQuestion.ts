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

/**
 * 
 * @export
 * @interface EnrollmentApplicationConditionQuestion
 */
export interface EnrollmentApplicationConditionQuestion {
    /**
     * Property name for the question in the submit application endpoint
     * @type {string}
     * @memberof EnrollmentApplicationConditionQuestion
     */
    Code?: string | null;
    /**
     * Defines if the question is required in the submit application endpoint
     * @type {boolean}
     * @memberof EnrollmentApplicationConditionQuestion
     */
    IsRequired?: boolean;
}
