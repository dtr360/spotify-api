# spotify-api
Access user information from Spotify using node.js, bootstrap, handlebars and ajax.

Set up Node.js using the steps outlined in the Spotify Web API Tutorial: https://developer.spotify.com/documentation/web-api/quick-start/  
This tutorial will go through the steps of setting up your application and settings on Spotify.

You will need to install Node.js. Enter ```node -v``` in the Terminal to verify that Node.js is installed and to see the version of Node.js that is installed. If you do have Node.js installed, it will output the version. You should update to the latest version using ```npm i -g npm```.  

Go to **nodejs.org**. You'll see download links.

You will also need npm. Install this in the Terminal via:
```
npm install
```

When the installation is completed, check that your project folder now contains a subfolder called node_modules with a bunch of packages inside.

You will also need to install the following:  
```
npm install --save express  
npm install --save request  
npm install --save cors  
npm install --save cookie-parser  
```

In order to run the webpage, open the Terminal.
Navigate to your folder with the **app.html** file (e.g. cd /spotify/get-user-info)
Run the following in the Terminal to start up the **Node.js** server:  
```
node app.js
```

You should see: 
```
Listening on 8888
```

Open a brower and enter the url: **localhost:8888**





