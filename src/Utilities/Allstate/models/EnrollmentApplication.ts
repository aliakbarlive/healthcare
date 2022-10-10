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
    EnrollmentAdditionalInsuranceInformation,
    EnrollmentContactInformation,
    EnrollmentCoverageInformation,
    EnrollmentEmploymentInformation,
    EnrollmentMedicalHistory,
    EnrollmentMember,
} from './';

/**
 * 
 * @export
 * @interface EnrollmentApplication
 */
export interface EnrollmentApplication {
    /**
     * 
     * @type {boolean}
     * @memberof EnrollmentApplication
     */
    AgreedToAuthorization?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof EnrollmentApplication
     */
    AgreedToFederalMandate?: boolean;
    /**
     * 
     * @type {string}
     * @memberof EnrollmentApplication
     */
    EmployerName: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnrollmentApplication
     */
    Signature: string | null;
    /**
     * 
     * @type {EnrollmentAdditionalInsuranceInformation}
     * @memberof EnrollmentApplication
     */
    AdditionalInsuranceInformation?: EnrollmentAdditionalInsuranceInformation;
    /**
     * 
     * @type {EnrollmentContactInformation}
     * @memberof EnrollmentApplication
     */
    ContactInformation?: EnrollmentContactInformation;
    /**
     * 
     * @type {EnrollmentCoverageInformation}
     * @memberof EnrollmentApplication
     */
    CoverageInformation: EnrollmentCoverageInformation;
    /**
     * 
     * @type {EnrollmentEmploymentInformation}
     * @memberof EnrollmentApplication
     */
    EmploymentInformation: EnrollmentEmploymentInformation;
    /**
     * 
     * @type {EnrollmentMedicalHistory}
     * @memberof EnrollmentApplication
     */
    MedicalHistory?: EnrollmentMedicalHistory;
    /**
     * 
     * @type {Array<EnrollmentMember>}
     * @memberof EnrollmentApplication
     */
    Members?: Array<EnrollmentMember> | null;
}
