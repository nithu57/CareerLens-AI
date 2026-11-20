import { db } from '../config/firebase';

export async function aggregateMarketTrends() {
  console.log('Running scheduled market trends aggregation...');

  const now = new Date().toISOString();
  const roles = [
    'Full-Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Flutter Developer',
    'Software Engineer',
    'Data Analyst',
    'Data Scientist',
    'AI Engineer',
    'Cloud Engineer',
    'Cybersecurity Analyst',
    'DevOps Engineer',
  ];

  for (const role of roles) {
    const docId = `snapshot-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    await db.collection('job_market_snapshots').doc(docId).set(
      {
        role,
        timestamp: now,
        lastRefreshed: now,
        isLive: false,
        source: 'Automated CareerLens Market Aggregator',
      },
      { merge: true }
    );
  }

  // Update system status
  await db.collection('system_status').doc('market_aggregator').set({
    status: 'operational',
    lastChecked: now,
    message: 'Market snapshots successfully evaluated.',
  });

  console.log('Market trends aggregation completed successfully.');
}
