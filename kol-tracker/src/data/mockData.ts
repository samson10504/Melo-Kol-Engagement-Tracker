// File: src/data/mockData.ts

export const mockPosts = [
  { 
    url: 'https://www.instagram.com/p/123', 
    kolId: 1, 
    creation_date: '2023-07-26', 
    counts: [
      { date: '2023-08-02', likes: 1000, views: 5000 },
      { date: '2023-08-26', likes: 1500, views: 7500 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/124', 
    kolId: 2, 
    creation_date: '2023-07-27', 
    counts: [
      { date: '2023-08-03', likes: 800, views: 4200 },
      { date: '2023-08-27', likes: 1200, views: 6100 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/125', 
    kolId: 3, 
    creation_date: '2023-07-28', 
    counts: [
      { date: '2023-08-04', likes: 1500, views: 9000 },
      { date: '2023-08-28', likes: 1800, views: 10500 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/126', 
    kolId: 4, 
    creation_date: '2023-07-29', 
    counts: [
      { date: '2023-08-05', likes: 700, views: 3400 },
      { date: '2023-08-29', likes: 950, views: 4600 }
    ]
  },
  { 
    url: 'https://www.instagram.com/p/127', 
    kolId: 5, 
    creation_date: '2023-07-30', 
    counts: [
      { date: '2023-08-06', likes: 1100, views: 5600 },
      { date: '2023-08-30', likes: 1350, views: 6700 }
    ]
  },
  // Add more mock posts as needed
];

export const mockKols = [
  { id: 1, name: 'John Doe', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=John' },
  { id: 2, name: 'Jane Smith', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Jane' },
  { id: 3, name: 'Bob Johnson', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Bob' },
  { id: 4, name: 'Alice Martin', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Alice' },
  { id: 5, name: 'Michael Lee', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Michael' },
  // Add more mock KOLs as needed
];