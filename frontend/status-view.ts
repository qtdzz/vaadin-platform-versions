import {LitElement, customElement, html, query} from 'lit-element';
import { StatusController } from './status-controller';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column.js';
import '@vaadin/vaadin-lumo-styles/badge.js';
import * as moment from 'moment';
import RoadmapItem from './generated/com/qtdzz/platform/model/RoadmapItem';
import '@polymer/paper-toggle-button/paper-toggle-button.js'

@customElement('status-view')
export class VersionViewElement extends LitElement {
  private statusController: StatusController = new StatusController();
  private shouldShowDeprecated: boolean = false;
  private roadmapItems: any[] = [];
  private versions: Array<string> = [];
  private latestReleaseMap: {[key: number]: Array<string>} = {};
  private ltsVersions: Array<string> = [];
  private latestVersions: Array<string> = [];
  private comingVersions: Array<string> = [];
  @query('#platformGrid')
  platformGrid : any;

  @query('#platformColumn')
  platformColumn : any;

  @query('#gaDateColumn')
  gaDateColumn : any;

  @query('#endDateColumn')
  endDateColumn : any;

  @query('#statusColumn')
  statusColumn : any;

  @query('#statusGrid')
  statusGrid : any;

  @query('#showDeprecatedButton')
  showDeprecatedButton: any;

  createRenderRoot() {return this;}

  render() {
    return html`
    <p>
      <paper-toggle-button class="lumo" id="showDeprecatedButton" ?checked="${this.shouldShowDeprecated}">
        Show deprecated versions.
      </paper-toggle-button>
    </p>
    <vaadin-grid id="platformGrid" theme="row-stripes column-borders wrap-cell-content" style="height: 100vh;">
      <vaadin-grid-column resizable id="platformColumn" header="Platform Version">
      </vaadin-grid-column>
      <vaadin-grid-column path="status" id="statusColumn" header="Status">
      </vaadin-grid-column>
      <vaadin-grid-column resizable id="releaseColumn" header="Release">
      </vaadin-grid-column>
      <vaadin-grid-column resizable id="gaDateColumn" header="General Availability">
      </vaadin-grid-column>
      <vaadin-grid-column resizable id="endDateColumn" header="Support Expiration">
      </vaadin-grid-column>
    </vaadin-grid>
    <custom-style>
      <style include="lumo-badge">
        [theme~="badge"][theme~="error"][theme~="primary"] {
          opacity: 0.5;
        }
        .status[theme~="badge"] {
          text-transform: uppercase;
        }
      </style>
      <style is="custom-style">
        .deprecated {
          opacity: 0.5;
        }
      </style>
    </custom-style>
    `;
  }
  firstUpdated() {
    this.showDeprecatedButton.addEventListener('checked-changed', (e: any) => {
      this.shouldShowDeprecatedClick(e.detail.value as boolean);
    });
    this.gaDateColumn.renderer = (root: any, _ : any, rowData: any) => {
      const gaMoment = moment(rowData.item.gaDate, 'DD-MM-YYYY');
      const relative = gaMoment.fromNow();
      root.innerHTML = `<div class="${rowData.item.status}"><p>${gaMoment.format('LL')}</p><p>(${relative})</p></div>`;
    };
    this.endDateColumn.renderer = (root: any, _ : any, rowData: any) => {
      const endMoment = moment(rowData.item.endDate, 'DD-MM-YYYY');
      const relative = endMoment.fromNow();
      root.innerHTML = `<div class="${rowData.item.status}"><p>${endMoment.format('LL')}</p><p>(${relative})</p></div>`;
    };
    this.statusColumn.renderer = (root: any, _ : any, rowData: any) => {
      const status = rowData.item.status;
      const style = this.createBadgeStyle(status);
      root.innerHTML = `<div class="status" theme="${style}">${status}</div>`;
    };
    this.platformColumn.renderer = (root: any, _ : any, rowData: any) => {
      root.innerHTML = `<span class="${rowData.item.status}">Vaadin ${rowData.item.major}</div>`;
    };
    this.statusController.getRoadMap().then((roadmaps: Array<RoadmapItem | null>) => {
      this.roadmapItems = roadmaps.map((i: any) => {
        i.status = this.getPlatformStatus(i);
        return i;
      });
      this.rebuildGridItems();
      this.statusController.getRelease().then((versions: Array<string | null>) => {
        this.versions = versions.filter(i => !!i) as Array<string>;
        this.roadmapItems.forEach((i: any) => {
          const latestVersion = this.findLatestVersionFromMajor(i.major);
          i.latestVersion = latestVersion;
        });
      });
    });
  }

  private isPrerelease(version: string): boolean {
    return version.includes('alpha') || version.includes('beta') || version.includes('rc');
  }

  private getLatestFromArray(versions: Array<string>): string {
    if (versions.length <= 0) {
      return '';
    }
    if (this.isPrerelease(versions[0])) {
      return versions[versions.length - 1];
    } else if (this.isPrerelease(versions[versions.length - 1])) {
      return versions[0];
    } else {
      return  versions[versions.length - 1];
    }
  }

  async shouldShowDeprecatedClick(show: boolean): Promise<void> {
    this.shouldShowDeprecated = show;
    this.rebuildGridItems();
  }

  async rebuildGridItems(): Promise<void> {
    const items = this.roadmapItems.filter(i => i.status !== 'deprecated' || this.shouldShowDeprecated);
    this.platformGrid.items = items;
    this.requestUpdate();
  }

  private createBadgeStyle(status: string) {
    if (status.includes('lts')) {
      return 'badge primary';
    } else if (status.includes('latest')) {
      return 'badge success primary';
    } else if (status.includes('deprecated')) {
      return 'badge error primary';
    } else {
      return 'badge contrast primary';
    }
  }
  private findLatestVersionFromMajor(major: number) {
    this.versions.forEach((version: string) => {
      if (version.startsWith(major.toString())) {
        const arr = this.latestReleaseMap[major] || [];
        arr.push(version);
        this.latestReleaseMap[major] = arr;
      }
    });
    if (this.latestReleaseMap[major]) {
      this.latestReleaseMap[major].sort((a: string, b: string) => {
        console.log('comparing ', a, b);
        const regex = /(\d+)\.(\d+)\.(\d+)(\.(alpha|beta|rc)(\d+))?/g;
        const matchA = regex.exec(a);
        const matchB = regex.exec(b);
        if (!matchA || !matchB) {
          return a > b ? 1 : -1;
        }
        if (matchA[6] && matchB[6]) {
          return matchA[6] > matchB[6] ? 1 : -1;
        }
        if (matchA[6] && !matchB[6]) {
          return -1;
        }
        if (!matchA[6] && matchB[6]) {
          return 1;
        }
        return Number(matchA[3]) - Number(matchB[3]);
      });
      console.log(this.latestReleaseMap);
      return this.getLatestFromArray(this.latestReleaseMap[major]);
    } else {
      return '';
    }
  }

  private getPlatformStatus(item: any) {
    const startDate: Date = moment(item.gaDate, 'DD-MM-YYYY').toDate();
    const endDate: Date = moment(item.endDate, 'DD-MM-YYYY').toDate();
    const now: Date = new Date();
    let status = '';
    if (startDate > now) {
      status += 'incoming';
      this.comingVersions.push(item);
    } else {
      if (item.isLTS) {
        status += 'lts';
        this.ltsVersions.push(item);
      } else if (startDate < now && endDate > now) {
        status += 'latest';
        this.latestVersions.push(item);
      } else if (endDate < now) {
        status += 'deprecated';
      }
    }
    return status;
  }
}
