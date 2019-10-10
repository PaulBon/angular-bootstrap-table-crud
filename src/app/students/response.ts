/**
 * The response to a REST call.
 */
export class Response {
    /**
     * Returns true if the REST call was successfully processed.
     */
    success: boolean;

    /**
     * An error message if the REST call failed.
     */
    error: string;
}
