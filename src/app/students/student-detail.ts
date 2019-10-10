/**
 * Represents a single detail record for a student.
 */
export interface StudentDetail {
    termCreatedDate: string;
    termDescription: string;
    applied: boolean;
    loansTotalAmount: number;
    attemptedHours: number;
    earnedHours: number;
    completionRate: number;
    gpa: number;
    financialAidStatus: string;
    financialAidStatusProj: string;
    enrolledHours: number;
    droppedHours: number;
    repeatedHours: number;
    attemptedHoursProj: number;
    completionRateProj: number;
    gpaRequired: number;
    addlHoursRequired: number;
}
