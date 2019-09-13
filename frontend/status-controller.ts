import * as versionService from './generated/VersionService';
import RoadmapItem from './generated/com/qtdzz/platform/model/RoadmapItem';

export class StatusController {

  async getRoadMap(): Promise<Array<RoadmapItem  | null>> {
    const getRoadmap = versionService.getRoadmap();
    return getRoadmap;
  }

  async getRelease(): Promise<Array<string | null>> {
    return versionService.getReleases();
  }
}
