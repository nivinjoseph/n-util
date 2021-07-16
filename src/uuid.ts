import * as uuid from "uuid";


// public
export class Uuid
{
    private constructor() { }

    /**
     * Returns a UUID.
     */
    public static create(): string
    {
        return uuid.v4();
    }
}