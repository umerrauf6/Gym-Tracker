import { describe, expect, it } from 'vitest';
import { mergeCloudSnapshots } from './offlineMerge';
import type { CloudSnapshot } from './cloudSync';

const base: CloudSnapshot = { displayName:'Athlete',email:'a@example.com',isPro:false,routines:[],history:[],progressPhotos:[],trainingProfile:{complete:false,goal:'muscle',experience:'beginner',daysPerWeek:3},settings:{weightUnit:'kg',restSeconds:90,notificationsEnabled:true} };

describe('offline snapshot merge', () => {
  it('keeps the newest routine edit and offline-created history', () => {
    const local={...base,routines:[{id:'r1',name:'Local',exerciseIds:[],createdAt:'2026-01-01',updatedAt:'2026-02-01'}],history:[{id:'h1',name:'Session',startedAt:'2026-02-01',completedAt:'2026-02-01',totalVolumeKg:0,exercises:[]}]};
    const remote={...base,routines:[{id:'r1',name:'Remote',exerciseIds:[],createdAt:'2026-01-01',updatedAt:'2026-01-15'}]};
    const result=mergeCloudSnapshots(local,remote);
    expect(result.routines[0].name).toBe('Local');
    expect(result.history).toHaveLength(1);
  });
  it('does not resurrect an item deleted while offline', () => {
    const remote={...base,routines:[{id:'deleted',name:'Old',exerciseIds:[],createdAt:'2026-01-01'}]};
    expect(mergeCloudSnapshots(base,remote,new Set(['deleted'])).routines).toEqual([]);
  });
});
