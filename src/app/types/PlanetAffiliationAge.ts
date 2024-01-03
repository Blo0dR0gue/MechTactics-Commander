type PlanetAffiliationAgeData = {
  planetID: number;
  affiliationID: number;
  planetText: string;
  universeAge: number;
};

type PlanetAffiliationAgeWithNamesData = PlanetAffiliationAgeData & {
  planetName: string;
  affiliationName: string;
};

export { PlanetAffiliationAgeData, PlanetAffiliationAgeWithNamesData };
