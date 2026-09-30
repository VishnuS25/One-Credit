import type { ResourceType, ResourceData, ActiveLease } from '../types';

export class ResourceManager {
  private resources: Record<ResourceType, ResourceData>;
  private activeLeasesLent: Map<string, ActiveLease> = new Map();
  private activeLeasesBorrowed: Map<string, ActiveLease> = new Map();

  constructor(initialResources: Record<ResourceType, ResourceData>) {
    this.resources = JSON.parse(JSON.stringify(initialResources));
  }

  public getSnapshot(): Record<ResourceType, ResourceData> {
    return JSON.parse(JSON.stringify(this.resources));
  }

  public getAvailable(type: ResourceType): number {
    const res = this.resources[type];
    if (!res) return 0;
    const available = res.capacity - (res.used + res.locked);
    return Math.max(0, Math.round(available * 10) / 10);
  }

  public getUsed(type: ResourceType): number {
    return this.resources[type]?.used ?? 0;
  }

  public getCapacity(type: ResourceType): number {
    return this.resources[type]?.capacity ?? 100;
  }

  public getLocked(type: ResourceType): number {
    return this.resources[type]?.locked ?? 0;
  }

  public canFulfill(type: ResourceType, amount: number): boolean {
    return this.getAvailable(type) >= amount;
  }

  public lockResource(type: ResourceType, amount: number): boolean {
    if (!this.canFulfill(type, amount)) return false;
    this.resources[type].locked += amount;
    return true;
  }

  public unlockResource(type: ResourceType, amount: number): void {
    if (this.resources[type]) {
      this.resources[type].locked = Math.max(0, this.resources[type].locked - amount);
    }
  }

  /**
   * Allocate resource as Provider for a Requester lease
   */
  public allocateLentResource(lease: ActiveLease): boolean {
    const res = this.resources[lease.resourceType];
    if (!res) return false;

    // Convert locked amount into actual 'used' allocation
    this.unlockResource(lease.resourceType, lease.amount);
    res.used = Math.min(res.capacity, res.used + lease.amount);

    this.activeLeasesLent.set(lease.id, { ...lease, status: 'ACTIVE' });
    return true;
  }

  /**
   * Requester receives borrowed resource, increasing temporary capacity or reducing local load
   */
  public acceptBorrowedResource(lease: ActiveLease): void {
    this.activeLeasesBorrowed.set(lease.id, { ...lease, status: 'ACTIVE' });
    // If barter return was agreed, provider might lock/consume requester's barter resource
    if (lease.returnOffering) {
      const returnRes = this.resources[lease.returnOffering.resourceType];
      if (returnRes) {
        returnRes.used = Math.min(returnRes.capacity, returnRes.used + lease.returnOffering.amount);
      }
    }
  }

  /**
   * Release resources when lease finishes
   */
  public releaseLentResource(leaseId: string): ActiveLease | null {
    const lease = this.activeLeasesLent.get(leaseId);
    if (!lease) return null;

    const res = this.resources[lease.resourceType];
    if (res) {
      res.used = Math.max(0, res.used - lease.amount);
    }
    this.activeLeasesLent.delete(leaseId);
    return { ...lease, status: 'EXPIRED' };
  }

  public releaseBorrowedResource(leaseId: string): ActiveLease | null {
    const lease = this.activeLeasesBorrowed.get(leaseId);
    if (!lease) return null;

    // Restore any barter resource requester had given
    if (lease.returnOffering) {
      const returnRes = this.resources[lease.returnOffering.resourceType];
      if (returnRes) {
        returnRes.used = Math.max(0, returnRes.used - lease.returnOffering.amount);
      }
    }
    this.activeLeasesBorrowed.delete(leaseId);
    return { ...lease, status: 'EXPIRED' };
  }

  public tickLeases(deltaSec: number): {
    expiredLent: ActiveLease[];
    expiredBorrowed: ActiveLease[];
  } {
    const expiredLent: ActiveLease[] = [];
    const expiredBorrowed: ActiveLease[] = [];

    // Tick Lent Leases
    for (const [id, lease] of this.activeLeasesLent.entries()) {
      lease.remainingTime -= deltaSec;
      if (lease.remainingTime <= 0) {
        const released = this.releaseLentResource(id);
        if (released) expiredLent.push(released);
      }
    }

    // Tick Borrowed Leases
    for (const [id, lease] of this.activeLeasesBorrowed.entries()) {
      lease.remainingTime -= deltaSec;
      if (lease.remainingTime <= 0) {
        const released = this.releaseBorrowedResource(id);
        if (released) expiredBorrowed.push(released);
      }
    }

    return { expiredLent, expiredBorrowed };
  }

  public getActiveLent(): ActiveLease[] {
    return Array.from(this.activeLeasesLent.values());
  }

  public getActiveBorrowed(): ActiveLease[] {
    return Array.from(this.activeLeasesBorrowed.values());
  }

  public reset(initialResources: Record<ResourceType, ResourceData>): void {
    this.resources = JSON.parse(JSON.stringify(initialResources));
    this.activeLeasesLent.clear();
    this.activeLeasesBorrowed.clear();
  }
}
