import { BrowserWindow, screen, ipcMain, app } from 'electron';
import * as path from 'path';
import { AppConstants } from '../AppConstants';
import { Database } from 'sqlite';
import { CoreConfig } from '../CoreConfig';
import { PlanetData } from '../../types/PlanetData';
import { AffiliationData } from '../../types/AffiliationData';
import { autoUpdater } from 'electron-updater';
import { PlanetAffiliationAgeData } from '../../types/PlanetAffiliationAge';
import { CSVHelper } from '../csv/CSVHelper';
import {
  AffiliationRepository,
  PlanetAffiliationAgeRepository,
  PlanetRepository
} from '../repositories';
import { DatabaseTables, ForcefullyOmit } from '../../types/UtilityTypes';

// TODO: Use only one window and switch loaded files

class AppWindow {
  private window: BrowserWindow;

  private planetRepository: PlanetRepository;
  private affiliationRepository: AffiliationRepository;
  private planetAffiliationAgeRepository: PlanetAffiliationAgeRepository;

  private csvHelper: CSVHelper;

  public constructor(
    private isDevelopment: boolean,
    private database: Database,
    private config: CoreConfig
  ) {
    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    this.window = new BrowserWindow({
      height: size.height,
      width: size.width,
      minHeight: 850,
      minWidth: 1700,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        devTools: this.isDevelopment ? true : false
      }
    });

    if (this.isDevelopment) this.loadPage('index.html');
    else this.loadPage('update.html');

    if (this.isDevelopment) {
      // Open the DevTools.
      setTimeout(() => {
        this.window.webContents.openDevTools();
      }, 1000);
    } else {
      this.window.removeMenu();
    }

    this.reloadRepositories();

    this.csvHelper = new CSVHelper(this, this.database);

    this.setupHandler();
  }

  public getWindow(): BrowserWindow {
    return this.window;
  }

  public loadPage(pageName: 'update.html' | 'dashboard.html' | 'index.html') {
    this.window.loadFile(path.join(AppConstants.PAGES_DIR, pageName));
    this.window.maximize();
  }

  public close(): void {
    this.window.close();
    ipcMain.removeAllListeners();
  }

  public sendIpc(channel: string, ...message): void {
    console.log(`Sending ${message} to ${channel}`);
    this.window.webContents.send(channel, ...message);
  }

  public reloadRepositories(): void {
    this.planetRepository = new PlanetRepository(this.database);
    this.affiliationRepository = new AffiliationRepository(this.database);
    this.planetAffiliationAgeRepository = new PlanetAffiliationAgeRepository(
      this.database
    );
  }

  private setupHandler() {
    ipcMain.handle('getPlanetsAtAge', (_, age: number) =>
      this.planetRepository.getAllInUniverseAge(age)
    );

    ipcMain.handle('getAllPlanets', () =>
      this.planetRepository.getAllWithTags()
    );

    ipcMain.handle('getAllAffiliations', () =>
      this.affiliationRepository.getAll()
    );

    ipcMain.handle('getAllPlanetAffiliationAges', () =>
      this.planetAffiliationAgeRepository.getAll()
    );

    ipcMain.handle('getAllPlanetAffiliationAgesWithNames', () =>
      this.planetAffiliationAgeRepository.getAllWithNames()
    );

    ipcMain.handle('getAllUniverseAges', () =>
      this.planetAffiliationAgeRepository.getAllUniverseAges()
    );

    ipcMain.handle(
      'updatePlanet',
      async (_, { id, ...planetRest }: PlanetData) =>
        this.planetRepository.updateWithTagsByKey({ id: id }, planetRest)
    );

    ipcMain.handle(
      'createPlanet',
      (_, planetData: ForcefullyOmit<PlanetData, 'id'>) =>
        this.planetRepository.createWithTags(planetData)
    );

    ipcMain.handle('deletePlanet', (_, planetID: number) =>
      this.planetRepository.deleteByKey({ id: planetID })
    );

    ipcMain.handle(
      'updateAffiliation',
      (_, { id, ...affiliationData }: AffiliationData) =>
        this.affiliationRepository.updateByKey({ id: id }, affiliationData)
    );

    ipcMain.handle(
      'createAffiliation',
      (_, affiliationData: ForcefullyOmit<AffiliationData, 'id'>) =>
        this.affiliationRepository.create(affiliationData)
    );

    ipcMain.handle('deleteAffiliation', (_, affiliationID: number) =>
      this.affiliationRepository.deleteByKey({ id: affiliationID })
    );

    ipcMain.handle(
      'updatePlanetAffiliationAge',
      (
        _,
        {
          affiliationID,
          planetID,
          universeAge,
          planetText
        }: PlanetAffiliationAgeData
      ) =>
        this.planetAffiliationAgeRepository.updateByKey(
          { affiliationID, planetID, universeAge },
          { planetText }
        )
    );

    ipcMain.handle(
      'createPlanetAffiliationAge',
      (_, data: PlanetAffiliationAgeData) =>
        this.planetAffiliationAgeRepository.create(data)
    );

    ipcMain.handle(
      'createPlanetAffiliationAges',
      (_, dataPoints: PlanetAffiliationAgeData[]) =>
        new Promise<PlanetAffiliationAgeData[]>((resolve, reject) => {
          const insertPromises = dataPoints.map((point) => {
            return this.planetAffiliationAgeRepository
              .create(point)
              .then(() => {
                return point;
              });
          });

          Promise.all(insertPromises)
            .then((results) => resolve(results))
            .catch((reason) => reject(reason));
        })
    );

    ipcMain.handle(
      'deletePlanetAffiliationAge',
      (_, { affiliationID, planetID, universeAge }: PlanetAffiliationAgeData) =>
        this.planetAffiliationAgeRepository.deleteByKey({
          affiliationID,
          planetID,
          universeAge
        })
    );

    ipcMain.handle('getConfigCache', () => {
      return this.config.getConfig();
    });

    ipcMain.handle('setConfigData', (event, key: string, value: unknown) => {
      return this.config.set(key, value);
    });

    ipcMain.handle('getAppData', () => {
      return {
        version: this.isDevelopment ? 'dev' : app.getVersion()
      };
    });

    ipcMain.handle('restartAndUpdate', () => {
      autoUpdater.quitAndInstall();
    });

    ipcMain.handle('exportTableToCSV', async (_, tableName: DatabaseTables) =>
      this.csvHelper.exportTableToCSV(tableName)
    );

    ipcMain.handle('importTableFromCSV', async (_, tableName: DatabaseTables) =>
      this.csvHelper.importTableFromCSV(tableName)
    );

    ipcMain.handle('exportDatabaseToCSVs', () => {
      throw new Error('Not implemented yet');
    });

    ipcMain.handle('importDatabaseFromCSVs', () => {
      throw new Error('Not implemented yet');
    });
  }
}

export { AppWindow };
