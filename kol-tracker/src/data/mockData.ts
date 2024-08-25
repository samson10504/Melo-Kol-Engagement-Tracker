// File: src/data/mockData.ts

export const mockPosts = [
  { 
    url: 'https://www.instagram.com/p/123', 
    kolId: 1, 
    creation_date: '2023-07-26T10:30:00.000Z', 
    counts: [
      { date: '2023-08-02T15:45:00.000Z', likes: 1000, comments: 50 },
      { date: '2023-08-26T09:20:00.000Z', likes: 1500, comments: 75 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/124', 
    kolId: 2, 
    creation_date: '2023-07-27T14:20:00.000Z', 
    counts: [
      { date: '2023-08-03T11:30:00.000Z', likes: 800, comments: 42 },
      { date: '2023-08-27T16:15:00.000Z', likes: 1200, comments: 61 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/125', 
    kolId: 3, 
    creation_date: '2023-07-28T08:45:00.000Z', 
    counts: [
      { date: '2023-08-04T13:10:00.000Z', likes: 1500, comments: 90 },
      { date: '2023-08-28T10:55:00.000Z', likes: 1800, comments: 105 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/126', 
    kolId: 4, 
    creation_date: '2023-07-29T17:30:00.000Z', 
    counts: [
      { date: '2023-08-05T09:40:00.000Z', likes: 700, comments: 34 },
      { date: '2023-08-29T14:25:00.000Z', likes: 950, comments: 46 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/127', 
    kolId: 5, 
    creation_date: '2023-07-30T12:15:00.000Z', 
    counts: [
      { date: '2023-08-06T16:50:00.000Z', likes: 1100, comments: 56 },
      { date: '2023-08-30T11:35:00.000Z', likes: 1350, comments: 67 }
    ]
  },
  // Add more mock posts as needed
];

export const mockKols = [
  { id: 1, name: 'Justin Cai', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Justin' },
  { id: 2, name: 'Leon Cheng', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Leon' },
  { id: 3, name: 'Samson Ng', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Samson' },
  { id: 4, name: 'Bibo Chui', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Bibo' },
  { id: 5, name: 'Anita Chen', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Anita' },
  // Add more mock KOLs as needed
];