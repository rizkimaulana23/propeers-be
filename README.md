# ArtSI
## Success Base Response

```json
{
	"timestamp": "2024-12-01T22:33:23",
	"status": 200,
	"message": "Message raised",
	"path": "/login",
	"result": {
		
	}
}
```

## Failed Base Response

```json
{
	"timestamp": "2024-12-01T22:33:23",
	"status": 404,
	"error": "Error raised from system",
	"message": "Message raised",
	"path": "/login"
}
```

# Authentication

## POST Authentication

Digunakan untuk mendapatkan JWT dan digunakan sebagai session untuk front-end.

- URL: `/api/authenticate`
- Role: All Users
- Headers:
    
    ```json
    {
    	"email": "example@email.com",
    	"password": "pw1234"
    }
    ```
    

### Success Response

```json
{
	"timestamp": "2024-12-01T22:33:23",
	"status": 200,
	"message": "Message raised",
	"path": "/api/authenticate",
	"result": {
		"jwt" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
	}
}
```

### Failed Response

```json
{
	"timestamp": "2024-12-01T22:33:23",
	"status": 404,
	"error": "User not found",
	"message": "Message raised",
	"path": "/api/authenticate"
}
```

# User

## GET All Users

Digunakan untuk mendapatkan semua user. Dapat menggunakan query parameter untuk filtering berdasarkan role-nya.

- URL: `/api/users?role=role1,role2`
- Role: Admin, Direksi, Social Media Manager (Freelancer saja)

### Success Response

Success Response dapat berbeda-beda tergantung dengan role dari user yang diambil. Apabila pada role tersebut tidak ada data untuk suatu field tertentu, akan dikirimkan dengan `null`.

```json
{
	"timestamp": "2024-12-01T22:33:23",
	"status": 200,
	"message": "User berhasil didapatkan",
	"path": "/api/users",
	"result": [
		{
			"id": "USER001",
			"email": "example@email.com",
			"name": "Full Name",
			"noTelephone": "+62 1234567890",
			"role": "CLIENT",
			"description": "Saya adalah client",
			"status": "Active",
			"speciality": [ "Video Editor", "Content Creator" ],
			"namaBank": "BRI",
			"noRek": "1234567890"
		},
	]
}
```

## GET Users

Digunakan untuk mendapatkan users dengan email tertentu. 

- URL: `/api/users/:email`
- Role: All User
    
    Tiap role memiliki akses yang berbeda dalam mendapatkan informasinya.
    
    - Admin, Direksi, General Manager: Dapat mengakses semua akun
    - Talent, Client: hanya dapat mengakses akunnya sendiri

### Success Response

```json
{
	"timestamp": "2024-12-01T22:33:23",
	"status": 200,
	"message": "User berhasil didapatkan",
	"path": "/api/users/example@email.com",
	"result": {
			"id": "USER001",
			"email": "example@email.com",
			"name": "Full Name",
			"noTelephone": "+62 1234567890",
			"role": "CLIENT",
			"description": "Saya adalah client",
			"status": "Active",
			"speciality": [ "Video Editor", "Content Creator" ],
			"namaBank": "BRI",
			"noRek": "1234567890"
		}
}
```

## POST Create Users

Digunakan untuk membuat users baru.

- URL: `api/users/register`
- Role: Admin
- Headers:
    
    Headers yang dibutuhkan tergantung Role dari user yang ingin dibuat.
    
    - Direksi, General Manager, Client, Social Media Manager
        
        ```json
         {
        	 "email": "rizki@gmail.com",
        	 "password": "pw1234",
        	 "name": "Rizki Maulana",
        	 "deskripsi": "Saya adalah Rizki Maulana",
        	 "role": "DIREKSI"
         }
        ```
        
    - Freelancer
        
        ```json
         {
        	 "email": "rizki@gmail.com",
        	 "password": "pw1234",
        	 "name": "Rizki Maulana",
        	 "deskripsi": "Saya adalah Rizki Maulana",
        	 "speciality": "Videographer",
        	 "role": "DIREKSI"
         }
        ```
        

### Success Response

### Failed Response

## PUT Edit Users

Digunakan untuk

- URL: `/api/users/:email`
- Role: All User
- Headers:
    
    Headers yang dibutuhkan bergantung pada role-nya:
    
    ```json
    
    ```
    

### Success Response

### Failed Response

## POST Change Password

Digunakan untuk mengganti password suatu akun.

- URL: `/api/users/change-password`
- Role: All User
- Headers:
    
    ```json
    {
    	"oldPassword": "OldPass123",
    	"newPassword": "NewPass123"
    }
    ```
    

### Success Response

```json
{
	"timestamp": "2024-12-01T22:33:23",
	"status": 200,
	"message": "Password berhasil diganti",
	"path": "/api/users/change-password",
	"result": null
}
```

### Failed Response

- Input password lama salah
    
    ```json
    {
    	"timestamp": "2024-12-01T22:33:23",
    	"status": 400,
    	"error": "",
    	"message": "Password lama tidak sesuai",
    	"path": "/login"
    }
    ```
    

# Project

## GET All Projects

## GET Project

## POST Create Project

## PUT Edit Project

## DELETE Delete Project

# Finance

## GET Talent Commission

## PUT Talent Comission

## Update Talent Comission

# Talent

## POST Assign Talent to Project

## PUT Assign Talent to Project

## DELETE Assign Talent to Project