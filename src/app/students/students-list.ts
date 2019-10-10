import { Student } from './student';

/**
 * The results of the REST call to retreive the students.
 */
export interface StudentsList {

    /**
     * The students retrieved based on the sorting, filtering and paging values.
     */
    students: Student[];

    /**
     * The total number of students that exist.
     * NOTE: this is not the number of students retrieved.
     */
    totalStudents: number;
}
