# Transactions service for transactions app


## Transactions50 is my final project for Harvards CS50 Web Programing with Python and JavaScript
This app allow users to buy,sell,withdraw,send cryptocurency, to process fiat operations app using Stripe and PayPal API, to do cryprocurency operations app using MetaMask API.

To do this user needs to have account in application, there is three types of accounts: Browsing, Basic and Full. 
 - Browsing - account allowing to check application. Only email and password required
 - Basic - standart account with no KYC, just last name, first name DOB etc . Allows users to deposit, withdraw and send cryptocurency within ETH network.
 - Full - account with KYC verification allows users to deposit fiat,withdraw fiat, buy cryptocurency and sell it.

It consists of 6 microservices:
 - Authentication service 
 - User managment service/API Gateway
 - Payment gateway service
 - Transactions service
 - Walet integration service
 - Notification service
And UI app

![Screenshot 2023-04-23 at 8 32 21 pm](https://user-images.githubusercontent.com/71220725/233834675-4f61453a-9dc8-4dab-998a-3e86c2dc5b60.png)



### Infrastructure: 
All services are containerised appliacitons and all can be bootstrapped using scripts in ```infrastructure``` folder, all additional resources may be bootstraped using docker compose script in ```infrastructure/platform``` it includes:
- Postgres database with credentials
- Postgres database with transactions
- MongoDb with user information
- RedisJSON db with some of users information
- RabbitMQ for comunication beetween services
- Consul client to register microservices with consul
- Consul server to make health requests
- Jaeger server to display Open Telemetry data

## Services description:

### Authentication service 
Django REST API connected to PostgreSQL database with users credentials used to create new user, authenticate user, change user's password or email, delete user's account. As a method of comunication app using HTTP, so its standart REST API.

To secure API http request must include eather API KEY or Authorisation credentials to make successful request.

App running in container and connected to Consul server, Jaeger via OpenTelemtry and postgreSQL server.

* container runs interactivly to deregister service from Consul when it stopped correctly, so it should be stopped only from containers bash *

To run this container running postgres container (```infrastructure/platform/docker-compose.yaml```)(infrastructure repo) <b>at least</b> required.

All settings of Django app contains in docker run script named ```infrastructure/auth-service-deploy.sh```(infrastructure repo)  and may be specified in it before running, all sensitive data should be stored in Kubernetes or Docker swarm secrets. 

#### To obtain API key:
After starting container, go to containers shell 
        

            docker exec -it <container_id> bash

in there apply migrations

  
            python3 manage.py migrate
   
than go to python shell

 
            python3 manage.py shell
  
in there execute:

    from rest_framework_api_key.models import APIKey

    api_key, key = APIKey.objects.create_key(name="<service_name>")

and print key: 

```print(key)```



### API Gateway / User managment service
Express server built with Typescript using PostgreSQL to store transactions data, MongoDB to store users data and Redis to store frequently used data.
This server will act as gateway from frontend app and will recive all requests from client and then send data to other services via HTTP or RabitMQ.

Routes include : login,register,delete user,edit password, add/edit KYC of level 1 or 2 , get KYC data, get Redis data.

App running in container and connected to Consul server, Jaeger via OpenTelemtry and postgreSQL server.
    
All routes will be secured with JWT authentication with 2h expiration time, to obtain JWT user needs to pass authorisation (login/register in front-end app).

To run this container running postgres container, redis container and mongoDB container (```infrastructure/platform/docker-compose.yaml```)(infrastructure repo)  <b>at least</b> required.

All settings of Express app contains in docker run script named ```infrastructure/userManagment-service-deploy.sh```(infrastructure repo) and ```app/config/*``` in they may be specified in it before running, all sensitive data should be stored in Kubernetes or Docker swarm secrets. 

To do requests to authentication service we need to specify API_KEY in container deployment script (```infrastructure/userManagment-service-deploy.sh```)(infrastructure repo)


### Transactions service
Express server (to Connect to Consul and Jaeger) built with JavaScript using PostgreSQL to store transactions data.
This app will consume messages via RabbitMQ from other transaction related services and write to Postgres transactions database.

App running in container and connected to Consul server, Jaeger via OpenTelemtry, RabbitMQ server and postgreSQL server.
    

To run this container running postgres container and RabbitMQ container (```infrastructure/platform/docker-compose.yaml```)(infrastructure repo)  <b>at least</b> required.

All settings of Express app contains in docker run script named ```infrastructure/transactions-service-deploy.sh```(infrastructure repo) and ```app/config/*``` in they may be specified in it before running, all sensitive data should be stored in Kubernetes or Docker swarm secrets. 



### Payments service 
Express server (to Connect to Consul and Jaeger) built with TypeScript using PayPal or Stripe APIs to handle payments.
This app will consume messages via RabbitMQ from API Gateway and send response with payment url/details/confirmation back.


App running in container and connected to Consul server, Jaeger via OpenTelemtry and RabbitMQ server.

To run this container running RabbitMQ container (```infrastructure/platform/docker-compose.yaml```)(infrastructure repo)  <b>at least</b> required.

All settings of Express app contains in docker run script named ```infrastructure/payments-service-deploy.sh```(infrastructure repo) and ```app/config/*``` in they may be specified in it before running, all sensitive data should be stored in Kubernetes or Docker swarm secrets. 
