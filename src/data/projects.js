export const projects = [
  {
    name: 'UNIFI MOBILITY',
    path: '/projects/mobile-router',
    color: '#4A90D9',
    tags: ['UI/UX Design', 'Networking', 'Ubiquiti'],
  },
  {
    name: 'UNIFI PLAY',
    path: '/projects/poweramp',
    color: '#E85D75',
    tags: ['Audio Product', 'UI/UX Design', 'Ubiquiti'],
  },
  {
    name: 'FIGARROW',
    path: '/projects/figarrow',
    color: '#F24E1E',
    tags: ['Figma Plugin', 'AI Augmented', 'Productivity'],
  },
  {
    name: 'TREE POINT',
    path: '/projects/tree-point',
    color: '#50C878',
    tags: ['Fintech', 'Loyalty Program', 'Cathay'],
  },
  {
    name: 'INTERACTION LAB',
    path: '/projects/interaction-lab',
    color: '#9B59B6',
    tags: ['Prototyping', 'ProtoPie', 'Interaction Design'],
  },
]

// Tags shown when no project is hovered (default Home view).
export const defaultTags = ['IoT Product', 'Fintech', 'AI Augmented']

export function getProjectByPath(path) {
  return projects.find((p) => p.path === path)
}
