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
 * @interface EnrollmentConditionResponses
 */
export interface EnrollmentConditionResponses {
    /**
     * Date diagnosed
     * @type {Date}
     * @memberof EnrollmentConditionResponses
     */
    DiagnosedDate?: Date;
    /**
     * Date last treated
     * @type {Date}
     * @memberof EnrollmentConditionResponses
     */
    LastTreatedDate?: Date;
    /**
     * Under current treatment?
     * @type {boolean}
     * @memberof EnrollmentConditionResponses
     */
    UnderCurrentTreatment?: boolean;
    /**
     * Provide treatment details
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    TreatmentDetails: string | null;
    /**
     * Location of Cancer/Tumor
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    LocationOfCancer?: string | null;
    /**
     * Stage of Cancer/Tumor
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    StageOfCancer?: string | null;
    /**
     * Type of Diabetes
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    TypeOfDiabetes?: string | null;
    /**
     * Complications including Retinopathy, Neuropathy, Nephropathy?
     * @type {boolean}
     * @memberof EnrollmentConditionResponses
     */
    DiabetesComplications?: boolean | null;
    /**
     * Provide complications details
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    DiabetesComplicationDetails?: string | null;
    /**
     * Type of Lupus
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    TypeOfLupus?: string | null;
    /**
     * Provide details for any Counseling and Hospitalizations
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    MentalCounselingHospitalizationDetails?: string | null;
    /**
     * How many migraines/headaches per month?
     * @type {string}
     * @memberof EnrollmentConditionResponses
     */
    MigrainesHeadachesPerMonth?: string | null;
    /**
     * Pregnancy Due Date
     * @type {Date}
     * @memberof EnrollmentConditionResponses
     */
    PregnancyDueDate?: Date | null;
    /**
     * Date of transplant
     * @type {Date}
     * @memberof EnrollmentConditionResponses
     */
    TransplantDate?: Date | null;
}

