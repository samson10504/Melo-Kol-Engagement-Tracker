// File: src/data/mockData.ts

export const mockPosts = [
    { 
      id: 1, 
      url: 'https://www.instagram.com/p/123', 
      kolId: '1', 
      creation_date: '2023-07-26', 
      counts: [
        { date: '2023-08-02', likes: 1000, views: 5000 },
        { date: '2023-08-26', likes: 1500, views: 7500 }
      ]
    },
    // Add more mock posts as needed
  ];
  
  export const mockKols = [
    { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=John' },
    { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Jane' },
    { id: '3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Bob' },
  ];