/**
 * Represents the filter for a single table column.
 */
export class TableFilter {

    /**
     * The column/field to filter.
     */
    field: string;

    /**
     * The filter operator.
     */
    operator: string;

    /**
     * The filter value.
     */
    value: string;
}
