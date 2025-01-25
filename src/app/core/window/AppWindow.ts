import { BrowserWindow, screen, ipcMain, app } from 'electron';
import * as path from 'path';
import { AppConstants } from '../AppConstants';
import { Database } from 'sqlite';
import { CoreConfig } from '../CoreConfig';
import { PlanetData } from '../../types/PlanetData';
import { AffiliationData } from '../../types/AffiliationData';
import { autoUpdater } from 'electron-updater';
import { PlanetAffiliationAgeData } from '../../types/PlanetAffiliationAge';
import {
  exportDatabaseToCSVs,
  exportTableToCSV,
  importDatabaseFromCSVs,
  importTableFromCSV,
  selectCSVDestination
} from '../CSVHelper';
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

    this.planetRepository = new PlanetRepository(this.database);
    this.affiliationRepository = new AffiliationRepository(this.database);
    this.planetAffiliationAgeRepository = new PlanetAffiliationAgeRepository(
      this.database
    );

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

  private setupHandler() {
    ipcMain.handle('getPlanetsAtAge', (_, age: number) =>
      this.planetRepository.getAllInUniverseAge(age)
    );

    ipcMain.handle('getAllPlanets', () => this.planetRepository.getAll());

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
        this.planetRepository.update(id, planetRest)
    );

    ipcMain.handle(
      'createPlanet',
      (_, planetData: ForcefullyOmit<PlanetData, 'id'>) =>
        this.planetRepository.create(planetData)
    );

    ipcMain.handle('deletePlanet', (event, planetID: number) =>
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
      (_, data: PlanetAffiliationAgeData) =>
        this.planetAffiliationAgeRepository.update(data)
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
      (_, data: PlanetAffiliationAgeData) =>
        this.planetAffiliationAgeRepository.delete(data)
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

    ipcMain.handle(
      'exportTableToCSV',
      async (event, tableName: DatabaseTables) => {
        const filePath = await selectCSVDestination(this, true, false);
        if (!filePath)
          return new Promise<void>((resolve) => {
            resolve();
          });
        return exportTableToCSV(this.database, tableName, filePath);
      }
    );

    ipcMain.handle(
      'importTableFromCSV',
      async (event, tableName: DatabaseTables) => {
        const filePath = await selectCSVDestination(this, false, false);
        if (!filePath)
          return new Promise<void>((resolve) => {
            resolve();
          });
        return importTableFromCSV(this.database, tableName, filePath);
      }
    );

    ipcMain.handle('exportDatabaseToCSVs', () => {
      return exportDatabaseToCSVs(this, this.database);
    });

    ipcMain.handle('importDatabaseFromCSVs', () => {
      return importDatabaseFromCSVs(this, this.database);
    });
  }
}

export { AppWindow };
