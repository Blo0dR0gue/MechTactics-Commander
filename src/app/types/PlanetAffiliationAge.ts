export type PlanetAffiliationAgeData = {
  planetID: number;
  affiliationID: number;
  planetText: string;
  universeAge: number;
};

export type PlanetAffiliationAgeWithNamesData = PlanetAffiliationAgeData & {
  planetName: string;
  affiliationName: string;
};

export type DynamicPlanetAffiliationConnectData = {
  planetID: number;
  planetName: string;
  affiliationData: {
    [key: `age${number}`]: {
      universeAge?: number;
      affiliationID?: number;
      planetText?: string;
      affiliationName?: string;
    };
  };
};
