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

type DynamicPlanetAffiliationConnectData = {
  planetID: number;
  planetName: string;
  affiliationData: {
    [key: `age${number}`]: {
      universeAge: number;
      affiliationID: number;
      planetText: string;
      affiliationName: string;
    };
  };
};

export {
  PlanetAffiliationAgeData,
  PlanetAffiliationAgeWithNamesData,
  DynamicPlanetAffiliationConnectData,
};
