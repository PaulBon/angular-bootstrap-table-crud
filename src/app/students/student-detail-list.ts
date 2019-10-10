import { StudentDetail } from './student-detail';

/**
 * The results of the REST call to retreive the details for a student.
 */
export interface StudentDetailList {

    /**
     * The detail records retrieved for the student based on the sorting, filtering and paging values.
     */
    details: StudentDetail[];

    /**
     * The total number of detail records that exist for the student.
     * NOTE: this is not the number of detail records retrieved.
     */
    totalDetails: number;
}
