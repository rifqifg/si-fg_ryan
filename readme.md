### HMVC

#### Folder Structure
- App
- Modules
-  ```Module Name```
- Controllers
- Migrations
- Models
- Routes
- Validators

#### Steps
1. configure directory
**a. tsconfig.json**
Add the Module directory
**b. config/database.ts**
Add the Module's migrations directory
**c. .adonisrc.json**
Add the Module & Controller directory
**d. drive.ts**
	Set up local drive for new module, to be remember, base path is url for serving file, and if visibility is private make sure to make signedUrl when serving the file
	>	```moduleName```:  {
	driver:  'local',
	visibility:  'private',
	root:  Application.makePath('app/Modules/```Module Name```/uploads/'),
	basePath:  '/```Module Name```/uploads',
	serveFiles:  true
	}
2. Duplicate folder from App/Modules/Template and rename to your ```Module Name```