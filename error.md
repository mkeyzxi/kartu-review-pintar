ketika saya generate kartu buttonnya berubah memproses lalu muncul pesan "Terjadi kesalahan server" diterminal pesan juga muncul " POST /api/admin/generate 500 in 9604ms
 GET /api/admin/links/stats 200 in 305ms" dan console browser ada pesan juga "Failed to load resource: the server responded with a status of 500 (Internal Server Error)"

rules firestore saya saat ini adalah
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.admin == true;
    }
    
    // Links collection
    match /links/{slug} {
      // Public read untuk aktivasi kartu
      allow read: if true;
      
      // Only admin can create/update/delete
      allow create: if isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Scan Logs collection
    match /scanLogs/{logId} {
      // Public create untuk scan logging
      allow create: if true;
      
      // Only admin can read/delete
      allow read: if isAdmin();
      allow update: if false; // Scan logs immutable
      allow delete: if isAdmin();
    }
    
    // Admin Users collection
    match /adminUsers/{userId} {
      // Only admin can read/write
      allow read, write: if isAdmin();
    }
    
    // Admins collection (used for login)
    match /admins/{adminId} {
      // Only admin can read/write
      allow read, write: if isAdmin();
    }
  }
}


sedangkan indexed pada firestore saya 
Collection ID	
Fields indexed

Query scope	Index ID		Status	
scanLogs	
status
createdAt
__name__
Collection	CICAgOjXh4EK		Enabled	
scanLogs	
linkId
ipHash
createdAt
__name__
Collection	CICAgJiUpoMK		Enabled	
scanLogs	
status
createdAt
__name__
Collection	CICAgOi3kJAK		Enabled	

