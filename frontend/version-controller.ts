import * as versionService from './generated/VersionService';
import PlatformItem from './generated/com/qtdzz/model/PlatformItem';

export type SetPlatformItemsCallback = (items: Array<PlatformItem | null>) => void;

export class VersionController {
  constructor(
    private setPlatformItemsCallback: SetPlatformItemsCallback
  ) {}

  async setItemAction(): Promise<void> {
    const items = (await versionService.getFlowVersion());
    this.setPlatformItemsCallback(items);
  }
}
