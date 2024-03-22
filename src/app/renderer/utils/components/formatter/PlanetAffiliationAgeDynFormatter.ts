import {
  DynamicPlanetAffiliationConnectData,
  PlanetAffiliationAgeWithNamesData,
} from '../../../../types/PlanetAffiliationAge';
import { Formatter } from './Formatter';

export default class PlanetAffiliationAgeDynFormatter
  implements
    Formatter<
      PlanetAffiliationAgeWithNamesData[],
      DynamicPlanetAffiliationConnectData[]
    >
{
  parse(
    value: DynamicPlanetAffiliationConnectData[]
  ): PlanetAffiliationAgeWithNamesData[] {
    const planetAffiliationAgeWithNamesDataPoints =
      [] as PlanetAffiliationAgeWithNamesData[];

    value.forEach((planetAffiliationAgeConnect) => {
      const planetAffiliationAgeWithNamesObj = {
        planetID: planetAffiliationAgeConnect.planetID,
        planetName: planetAffiliationAgeConnect.planetName,
      } as Partial<PlanetAffiliationAgeWithNamesData>;
      Object.values(planetAffiliationAgeConnect.affiliationData).forEach(
        (affiliationData) => {
          planetAffiliationAgeWithNamesDataPoints.push({
            ...planetAffiliationAgeWithNamesObj,
            universeAge: affiliationData.universeAge,
            affiliationName: affiliationData.affiliationName,
            planetText: affiliationData.planetText,
          } as PlanetAffiliationAgeWithNamesData);
        }
      );
    });

    return planetAffiliationAgeWithNamesDataPoints;
  }

  format(
    value: PlanetAffiliationAgeWithNamesData[]
  ): DynamicPlanetAffiliationConnectData[] {
    const planetAffiliationConnectMap = new Map<
      number,
      DynamicPlanetAffiliationConnectData
    >();

    value.forEach((planetAffiliationAge) => {
      let item = planetAffiliationConnectMap.get(planetAffiliationAge.planetID);
      const key = `age${planetAffiliationAge.universeAge}` as `age${number}`;
      const affiliationData = {
        universeAge: planetAffiliationAge.universeAge,
        affiliationID: planetAffiliationAge.affiliationID,
        planetText: planetAffiliationAge.planetText,
        affiliationName: planetAffiliationAge.affiliationName,
      };
      if (!item) {
        item = {
          planetID: planetAffiliationAge.planetID,
          planetName: planetAffiliationAge.planetName,
          affiliationData: {},
        };
        planetAffiliationConnectMap.set(planetAffiliationAge.planetID, item);
      }

      item.affiliationData[key] = affiliationData;
    });

    return Array.from(planetAffiliationConnectMap.values());
  }
}
