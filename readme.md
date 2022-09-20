### HMVC
#### Folder Structure
 - App
	 - Modules
		 - ```Module Name```
			 - Controllers
			 - Migrations
			 - Models
			 - Routes
			 - Validators
#### steps
1. configure directory
	**a. tsconfig.json**
		Add the Module directory
	**b. config/database.ts**
		Add the Module's migrations directory
	**c. .adonisrc.json**
		Add the Module & Controller directory
2. Duplicate folder from App/Modules/Template and rename to your ```Module Name``` 