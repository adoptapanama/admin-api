# Adopta Panama Core Admin API Services
[![Build Status](https://travis-ci.org/adoptapanama/admin-api.svg?branch=master)](https://travis-ci.org/adoptapanama/admin-api)

Adopta Panama Core Backend Services. This application serves the website, the admin ui and the mobile app. Although it can run natively in a server, it is better suited to run within docker containers.

### Requirements
-   Node 8+
-   Docker >= 1.10 : [Installation Instructions Linux](https://docs.docker.com/linux/step_one/) - [Installation Instructions Mac](https://docs.docker.com/mac/step_one/)
-   Docker Compose >= 1.6.2 [Installation Instructions](https://docs.docker.com/compose/install/)

## Development
This repository includes scripts to enable easier development and testing of the application. To start the whole application ecosystem for development in the api service, run the following command

```shell
npm run docker:start
```

This will start all services in production mode except the api service, which will  start in development mode.

To access the api container and start developingm you can use the following command

```shell
npm run docker:bash
```

When a service starts in development mode, it mounts the current repository into the container so that you can write code in your preferred IDE locally, and the changes reflect automatically within the container.

However, the service in development must be run within the container to ensure that the code developed will run in the image built in Docker hub.

Same applies to installing packages with `npm install`. This has to be done within the container itself.

Finally, all development is done via feature branches in your forked repository, and then a PR is made into the develop branch in adoptapanama/admin-api.git repository. Releases are made into the master branch.

### Requirements
-   Docker >= 1.10 : [Installation Instructions Linux](https://docs.docker.com/linux/step_one/) - [Installation Instructions Mac](https://docs.docker.com/mac/step_one/)
-   Docker Compose >= 1.6.2 [Installation Instructions](https://docs.docker.com/compose/install/)

### Installing the app

You must first fork the admin api repository from Adopta Panama's Github into your Github account:

[https://github.com/adoptapanama/admin-api.git](https://github.com/adoptapanama/admin-api.git)

Next, clone the repository from your Github account

```shell
git clone git@github.com:{your github account}/admin-api.git
```

Next make sure you set the proper upstream to keep your code up to date.

```shell
git remote add upstream git@github.com:adoptapanama/admin-api.git
```

Once you've downloaded the files, change to the develop branch where the latest development code is.


Please remember you will be running your code within the container, so any npm packages you need to install, you should do it within the container. This will help you determine if you need to install additional dependencies in the container.

### Running the app

The application will download a Docker Compose file that will allow simple application execution. It will pull all the necessary containers where you will be running the app. It will also automatically mount the app folder.

#### Launching the containers

First make sure you are within the api root directory as the following command will mount the present working directory into the container, and execute the following command:

```shell
npm run docker:start
```

This will launch all the containers used for development and testing. It will launch a production environment with the api container running in development mode.

Access the api container by executing the following command:

```shell
npm run docker:bash
```

The app will not start automatically. You can start it with the `npm start` command.

Right at the bottom you should se an IPAddress property. This is the IP address of the container. In your browser hit `http://{docker ip}:3000` and you should be able to hit the application within the container.

In case you are in a Mac, you can check the IP by typing the following

```shell
docker-machine ip
```

### Stopping the containers

To stop the containers and the whole app ecosystem, run the following command:

```shell
npm run docker:kill
```

### Updating the ecosystem

Since Adopta Panama is running in a microservice oriented architecture, services get developed asynchronously so many times the docker images you have will be outdated. To update the ecosystem (except api since it is running in development mode therefore you should update it via git).

To update the ecosystem, run the following command:

```shell
npm run docker:update
```

This will update all images for containers running in production mode. Please note that after and update is imperative you stop and start the containers to ensure the code is up to date in each one by runnin `npm run docker:kill` and then `npm run docker:start`.


### Running tests

To run the tests, make sure you are in the `/app` directory within the container (this should be the default) and type:

```shell
npm test
```

Test results will show in the terminal. You can only run tests within your container. If you run them outside the container, they will fail.

### Checking Code Coverage and Linting

You can also perform code coverage and linting using Lab. To create the coverage report, type in the container

```shell
npm run coverage
```

To view the results, in your machine (not your container), in the root of the app directory, type

```shell
npm run coverage:open
```

This will open up the code coverage results in your default browser.

### Running License check

Every time you add a new package from npm or other source, run this command to make sure all licenses are compatible:

```shell
npm run licenses
```

You'll need to check by yourself within the results if the package and its dependencies licensing is compatible with the app's MIT license.

### Running Migrations

To run pending database migrations simply type:

```shell
npm run db:migrate
```

You can also run down a migration by using the command

```shell
npm run db:migrate:down
```

## Documentation

The application has Swagger built in, so you are able to view the service's documentation easily. Just start the application as explained above and hit the `http://{container's ip}:3000/documentation` url in your browser.

The Swagger client will allow you to view the documentation and make actual requests to the services provided by the api as it provides a REST client for making requests to the app.