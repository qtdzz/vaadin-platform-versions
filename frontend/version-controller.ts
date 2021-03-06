import * as versionService from './generated/VersionService';
import PlatformItemsResult from './generated/com/qtdzz/platform/model/PlatformItemsResult';

export type SetPlatformItemsCallback = (items: PlatformItemsResult, column: string) => void;
export type setReleasedVersionsCallback = (versions: Array<String | null>) => void;
export class VersionController {
  constructor(
    private setPlatformItemsCallback: SetPlatformItemsCallback,
    private setReleasedVersionsCallback: setReleasedVersionsCallback
  ) {}

  async setPlatformItems(platformVersion: string, column: string): Promise<void> {
    const cached = localStorage.getItem(platformVersion);
    if (cached) {
      this.setPlatformItemsCallback(JSON.parse(cached) as PlatformItemsResult, column);
    } else {
      const items = (await versionService.getVersionsIn(platformVersion));
      localStorage.setItem(items.platformVersion, JSON.stringify(items));
      this.setPlatformItemsCallback(items, column);
    }
  }

  async setReleasedVersions(): Promise<void> {
    const versions = (await versionService.getReleases());
    this.setReleasedVersionsCallback(versions);
  }

  async setPlatformItemsForLatestRelease(column: string): Promise<void> {
    const latestVersion = (await versionService.getLatestVersion());
    this.setPlatformItems(latestVersion, column);
  }
}
