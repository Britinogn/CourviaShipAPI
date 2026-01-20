import { getNames } from 'country-list';

export const countries = getNames();
export type Country = typeof countries[number];


// export default Country