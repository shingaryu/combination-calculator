import { TFunction } from "i18next";

export function translateSpeciesIfPossible(text: string, t: TFunction) {
  let species = text;
  let suffix = '';

  if (text.indexOf('-Galar') >= 0) {
    species = text.substring(0, text.indexOf('-Galar'));
    suffix = '(ガラル)';
  } else if (text.indexOf('-Alola') >= 0) {
    species = text.substring(0, text.indexOf('-Alola'));
    suffix = '(アローラ)';
  }

  const sanitizedKey = 'pokemon.species.' + species.replace(':', '').replace("'", '').replace('.', '').replace(' ', '').replace('-', '').replace('-', '').toLowerCase();
  const translated = t(sanitizedKey);
  if (translated === sanitizedKey) { // maybe missing key
    return text;
  } else {
    return translated + suffix;
  }
}