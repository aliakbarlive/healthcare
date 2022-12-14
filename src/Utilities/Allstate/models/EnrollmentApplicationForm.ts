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
    EnrollmentApplicationGeneralCondition,
    EnrollmentApplicationQuestion,
} from './';

/**
 * 
 * @export
 * @interface EnrollmentApplicationForm
 */
export interface EnrollmentApplicationForm {
    /**
     * Defines a list of questions that the submit application endpoint payload can have
     * @type {Array<EnrollmentApplicationQuestion>}
     * @memberof EnrollmentApplicationForm
     */
    Questions?: Array<EnrollmentApplicationQuestion> | null;
    /**
     * Defines a list of general conditions that the submit application endpoint payload can have
     * @type {Array<EnrollmentApplicationGeneralCondition>}
     * @memberof EnrollmentApplicationForm
     */
    GeneralConditions?: Array<EnrollmentApplicationGeneralCondition> | null;
}

