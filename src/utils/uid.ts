/**
 * @module uid
 *
 * @description
 * Client side implementation of the DHIS2 code (uid) generator.
 * ({@link https,//github.com/dhis2/dhis2-core/blob/ad2d5dea959aff3146d8fe5796cf0b75eb6ee5d8/dhis-2/dhis-api/src/main/java/org/hisp/dhis/common/CodeGenerator.java|CodeGenerator.java})
 *
 * This module is used to generate and validate DHIS2 uids. A valid DHIS2 uid is a 11 character string which starts with a letter from the ISO basic Latin alphabet.
 */

const abc = "abcdefghijklmnopqrstuvwxyz";
const letters = abc.concat(abc.toUpperCase());

const ALLOWED_CHARS = `0123456789${letters}`;

const NUMBER_OF_CODEPOINTS = ALLOWED_CHARS.length;
const CODESIZE = 11;

function randomWithMax(max: number) {
    return Math.floor(Math.random() * max);
}

/**
 * Generate a valid DHIS2 uid. A valid DHIS2 uid is a 11 character string which starts with a letter from the ISO basic Latin alphabet.
 *
 * @return {string} A 11 character uid that always starts with a letter.
 *
 * @example
 * import { generateUid } from 'd2/lib/uid';
 *
 * generateUid();
 */
export const generateUid = () => {
    // First char should be a letter
    let randomChars = letters.charAt(randomWithMax(letters.length));

    for (let i = 1; i < CODESIZE; i += 1) {
        randomChars += ALLOWED_CHARS.charAt(
            randomWithMax(NUMBER_OF_CODEPOINTS)
        );
    }

    // return new String( randomChars );
    return randomChars;
};
