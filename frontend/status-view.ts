import {LitElement, customElement, html, query} from 'lit-element';
import { StatusController } from './status-controller';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column.js';
import '@vaadin/vaadin-lumo-styles/badge.js';
import * as moment from 'moment';
import RoadmapItem from './generated/com/qtdzz/platform/model/RoadmapItem';
import '@polymer/paper-toggle-button/paper-toggle-button.js'
import { mavenVersionComparator } from './ultis';

@customElement('status-view')
export class VersionViewElement extends LitElement {
  private statusController: StatusController = new StatusController();
  private shouldShowDeprecated: boolean = false;
  private roadmapItems: any[] = [];
  private versions: Array<string> = [];
  private latestReleaseMap: {[key: number]: Array<string>} = {};
  private ltsVersions: Array<string> = [];
  private latestVersionItem: any = { major: -1, status: []};
  private comingVersions: Array<string> = [];
  @query('#platformGrid')
  platformGrid : any;

  @query('#platformColumn')
  platformColumn : any;

  @query('#releaseColumn')
  releaseColumn : any;

  @query('#gaDateColumn')
  gaDateColumn : any;

  @query('#endDateColumn')
  endDateColumn : any;

  @query('#statusColumn')
  statusColumn : any;

  @query('#extendedColumn')
  extendedColumn : any;

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
      <vaadin-grid-column resizable id="extendedColumn">
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
        .notAvailable {
          align-self: center;
          color: grey;
          opacity: 0.5;
        }
        .enterpriseSubscribers {
          font-weight: bold;
          right: 1px;
          top: 1px;
          position: absolute;
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
      const status = rowData.item.status.join(' ');
      const style = this.createBadgeStyle(status);
      root.innerHTML = `<div class="status" theme="${style}">${status}</div>`;
    };
    this.platformColumn.renderer = (root: any, _ : any, rowData: any) => {
      root.innerHTML = `<span class="${rowData.item.status.join(' ')}">Vaadin ${rowData.item.major}</span>`;
    };
    this.extendedColumn.headerRenderer =(root: any, _ : any) => {
      root.innerHTML = `Extended maintenance<span class="enterpriseSubscribers" theme="badge primary success">For enterprise subscribers</span>`;
    };
    this.extendedColumn.renderer = (root: any, _ : any, rowData: any) => {
      if (rowData.item.extendedDate) {
        const extendedMoment = moment(rowData.item.extendedDate, 'DD-MM-YYYY');
        root.innerHTML = `<div><p>${extendedMoment.format('LL')}</p><p>(${extendedMoment.fromNow()})</p></div>`;
      } else {
        root.innerHTML = `<span class="notAvailable">Not available</span>`;
      }
    };

    this.releaseColumn.renderer = (root: any, _ : any, rowData: any) => {
      if (rowData.item.latestStable) {
        root.innerHTML =
        `<p>Latest stable: <a href="https://github.com/vaadin/platform/releases/tag/${rowData.item.latestStable}" target="_blank"> ${rowData.item.latestStable}</a></p>
        <p>Latest prerelease: <a href="https://github.com/vaadin/platform/releases/tag/${rowData.item.latest}" target="_blank"> ${rowData.item.latest}</a></p>`
        ;
      } else if (rowData.item.latest) {
        root.innerHTML =
        `<p><a href="https://github.com/vaadin/platform/releases/tag/${rowData.item.latest}" target="_blank">${rowData.item.latest}</a></p>`;
      } else {
        root.innerHTML = '<span class="notAvailable">Not available</span>';
      }
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
          const latestVersions = this.findLatestVersionFromMajor(i.major);
          i.latestStable = latestVersions.latestStable;
          i.latest = latestVersions.latest;
        });
        this.rebuildGridItems();
      });
    });
  }

  private isPrerelease(version: string): boolean {
    return version.includes('alpha') || version.includes('beta') || version.includes('rc');
  }

  private getLatestStableFromSortedArray(versions: Array<string>): string {
    if (versions.length <= 0) {
      return '';
    }
    for (let i = versions.length - 1; i >= 0; i--) {
      if (!this.isPrerelease(versions[i])) {
        return versions[i];
      }
    }
    return '';
  }

  async shouldShowDeprecatedClick(show: boolean): Promise<void> {
    this.shouldShowDeprecated = show;
    this.rebuildGridItems();
  }

  async rebuildGridItems(): Promise<void> {
    const items = this.roadmapItems.filter(i => !i.status.includes('deprecated') || this.shouldShowDeprecated);
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
  private findLatestVersionFromMajor(major: number): any {
    this.versions.forEach((version: string) => {
      if (version.startsWith(major.toString())) {
        const arr = this.latestReleaseMap[major] || [];
        arr.push(version);
        this.latestReleaseMap[major] = arr;
      }
    });
    if (this.latestReleaseMap[major]) {
      this.latestReleaseMap[major].sort(mavenVersionComparator);
      const latestStable = this.getLatestStableFromSortedArray(this.latestReleaseMap[major]);
      const latest = this.latestReleaseMap[major][this.latestReleaseMap[major].length - 1];
      if (latestStable !== latest) {
        return {latest, latestStable};
      }
      return {latest};
    } else {
      return '';
    }
  }

  private getPlatformStatus(item: any) {
    const startDate: Date = moment(item.gaDate, 'DD-MM-YYYY').toDate();
    const endDate: Date = moment(item.endDate, 'DD-MM-YYYY').toDate();
    const now: Date = new Date();
    let statuses: Array<string> = [];
    if (startDate > now) {
      statuses.push('incoming');
      this.comingVersions.push(item);
    } else {
      if (startDate < now && endDate > now && item.major > this.latestVersionItem.major) {
        statuses.push('latest');
        this.latestVersionItem.status = this.latestVersionItem.status.filter((i: string) => i !== 'latest');
        this.latestVersionItem = item;
      }
      if (item.isLTS) {
        statuses.push('lts');
        this.ltsVersions.push(item);
      }
      if (endDate < now) {
        statuses.push('deprecated');
      }
    }
    return statuses;
  }
}
