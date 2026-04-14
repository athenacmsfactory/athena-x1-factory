import { getExistingSiteTypes } from './sitetype-api.js';
const types = getExistingSiteTypes();
console.log(`Found ${types.length} sitetypes.`);
if (types.length > 0) {
    console.log(`First one: ${types[0].name}`);
    const hasTrack = types.some(t => t.track);
    console.log(`Track info present? ${hasTrack ? 'YES (Wait, we flattened it!)' : 'NO (Correct!)'}`);
}
