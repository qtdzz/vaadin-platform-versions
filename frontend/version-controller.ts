import * as versionService from './generated/VersionService';
import PlatformItemsResult from './generated/com/qtdzz/model/PlatformItemsResult';

export type SetPlatformItemsCallback = (items: PlatformItemsResult, column: number) => void;
export type setReleasedVersionsCallback = (versions: Array<String | null>) => void;
export class VersionController {
  constructor(
    private setPlatformItemsCallback: SetPlatformItemsCallback,
    private setReleasedVersionsCallback: setReleasedVersionsCallback
  ) {}

  async setPlatformItems(platformVersion: string, column: number): Promise<void> {
    const items = (await versionService.getVersionsIn(platformVersion));
    this.setPlatformItemsCallback(items, column);
  }

  async setReleasedVersions(): Promise<void> {
    const versions = (await versionService.getReleases());
    this.setReleasedVersionsCallback(versions);
  }

  async setPlatformItemsForLatestRelease(column: number): Promise<void> {
    const items = (await versionService.getVersionsFromLatestRelease());
    this.setPlatformItemsCallback(items, column);
  }
}
