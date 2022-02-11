import * as uuid from "uuid";


// public
/**
 * @description A class that help with UUID.
 */
export class Uuid
{
    private constructor() { }

    /**
     * @description Generates a UUID.
     * 
     * @returns a UUID.
     */
    public static create(): string
    {
        return uuid.v4();
    }
}