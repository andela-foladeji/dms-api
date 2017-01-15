[![Build Status](https://travis-ci.org/andela-foladeji/dms-api.svg)](https://travis-ci.org/andela-foladeji/dms-api)
[![Coverage Status](https://coveralls.io/repos/github/andela-foladeji/dms-api/badge.svg?branch=develop)](https://coveralls.io/github/andela-foladeji/dms-api?branch=develop)
[![Code Climate](https://codeclimate.com/github/andela-foladeji/dms-api/badges/gpa.svg)](https://codeclimate.com/github/andela-foladeji/dms-api)

# Document Managemet System
Document Management System API contains several APIs that allows users to create, edit, retrieve and delete documents. It also offers a way to ensure that only authroized users can perform certain operations.

Development
-----------
The application was developed with [NodeJs](http://nodejs.org) while using [Express](http://expressjs.com) for routing. The [Postgres](http://postgresql.com) database was used with [sequelize](http://sequelizejs.com) as the ORM

Installation
------------
1.  Ensure you have NodeJs and postgres installed
2.  Clone the repository `git clone git@github.com:andela-foladeji/dms-api.git`
3.  Change your directory `cd dms-api`
4.  Install all dependencies `npm install`
5.  Run tests  `npm test`
6.  Start the app `npm start` and use [postman](https://www.getpostman.com/) to consume the API

## POSTMAN COLLECTION
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/be9b49d86a8e609e34ec)
Use the postman collection above and set up your environment variables for url and token

## API ENDPOINTS
**Users**

Request type | Endpoint | Action 
------------ | -------- | ------
POST | [/users](#create-users) | Create a new user
GET | [/users](#get-users) | Get all users
GET | [/users/:id](#get-a-user) | Get details of a specific user
PUT | [/users/:id](#update-user) | Edit user details
DELETE | [/users/:id](#delete-user) | Remove a user from storage
POST | [/users/login](#login) | To log a user in

**Roles**

Request type | Endpoint | Action 
------------ | -------- | ------
POST | [/role](#create-role) | Create a new role
GET | [/role](#get-roles) | Get all created roles

**Documents**

Request type | Endpoint | Action 
------------ | -------- | ------ 
POST | [/documents](#create-document) | Create a new document
GET | [/documents](#get-documents) | Retrieve all documents 
GET | [/documents/:id](#get-a-document) | Retrieve a specific document
GET | [/users/:id/documents](#get-documents-by-user) | Retrieve all documents created by a user
GET | [/documents?page=1&limit=10](#get-documents) | Retrieve maximum of first 10 documents
PUT | [/documents/:id](#update-document) | Update a specific document
DELETE | [/documents/:id](#delete-document) | Remove a specific document from storage

Users
-----

## Create Users
To create a new user, make a **POST** request to `/users`
#### Request
```
{
  "firstName": "Jane",
  "lastName": "Doe",
  "username": "janedoe",
  "email": "janedoe@mail.com",
  "password": "secretkey",
  "roleId": "1"
}
```
#### Response
```
json
{
  "done": true,
  "user": {
    "id": 1
      "firstName": "Jane",
      "lastName": "Doe",
      "username": "janedoe",
      "email": "janedoe@mail.com",
      "password": "dskjslk894u8hdk993289389dkndnjeiu34348fn",
      "roleId": "1",
      "createdAt": "2016-12-06T09:25:29.316Z",
      "updatedAt": "2016-12-06T09:25:29.316Z"
  },
  token: "d98whIHSKJHAKdskljEEWRjsdodsjci8943dskljEEWRjsdodsjci8943u9ru348jsdnxssSJoihs98r32u983yd98whIHSKJHAKdskljEEWRjsdodsjci8943u9ru348jsdnxssSJoihs98r32u983yd98whIHSKJHAK"
}
```

## Get Users
Fetches all users' details,
#### Request
  - Endpoint: **GET**: `/users`
  - Requires `Authorization` header to be set
#### Response
```
  [
    {
      "id": "1",
      "firstName": "Jane",
      "lastName": "Doe",
      "username": "janedoe",
      "email": "janedoe@mail.com",
      "roleId": "1",
      "createdAt": "2016-12-06T09:25:29.316Z",
      "updatedAt": "2016-12-06T09:25:29.316Z"
    }, {
      "id": "2",
      "firstName": "Dead",
      "lastName": "Pool",
      "username": "deadpool",
      "email": "deadpool@mail.com",
      "roleId": "2",
      "createdAt": "2016-12-06T09:25:29.316Z",
      "updatedAt": "2016-12-06T09:25:29.316Z"
    }
  ]
```

## Get A User
#### Request
  - Endpoint: **GET**: `/users/:id`
  - Requires `Authorization` header to be set
#### Response
```
  {
    "id": "1",
    "firstName": "Jane",
    "lastName": "Doe",
    "username": "janedoe",
    "email": "janedoe@mail.com",
    "roleId": "1",
    "createdAt": "2016-12-06T09:25:29.316Z",
    "updatedAt": "2016-12-06T09:25:29.316Z"
  }
```

## Update user
#### Request
  - Enpoint: **PUT**: `/users/:id`
  - Requires `Authorization` header to be set
```
{
  "firstName": "Doctor",
  "lastName": "Strange",
  "username": "docstrange",
  "email": "doctorstrange@marvel.com",
  "password": "astroprojection",
  "roleId": "1"
}
```
#### Response
Body (application/json)
```
  {
    "done": true,
    "user": {
      "firstName": "Doctor",
      "lastName": "Strange",
      "username": "docstrange",
      "email": "doctorstrange@marvel.com",
      "roleId": "1"
    }
  }
```

## Delete user
#### Request
  - Enpoint: **DELETE**: `/users/:id`
  - Requires `Authorization` header to be set
#### Response
Body (application/json)
```
  {
    "done": true
  }
```

## Login
#### Request
  - Endpoint: **POST**: `/users/login`
  - Body (application/json)
```
{
  "username": "docstrange",
  "password": "astroprojection"
}
```
#### Response
Body (application/json)
```
{
  "done": true,
  "user": {
    "firstName": "Doctor",
    "lastName": "Strange",
    "username": "docstrange",
    "email": "doctorstrange@marvel.com",
    "roleId": "1"
  },
  token: "sdfeofJOIFiflfjKJ48lj8949fjeofJOIFiflffjKJ4848wjKJ484894NNsdfeofJOIFifUNnowIFiflfjKJ4848wesflfjKJ4848"
}
```

ROLES
-----
## Create Role
#### Request
  - Endpoint **POST** `/role`
  - Requires `Authorization` header to be set
Body (application/json)
```
{
  "title": "Admin"
}
```
#### Response
Body (application/json)
```
{
  "done": true
}
```

## Get Roles
#### Request
  - Endpoint **GET** `/role`
  - Requires `Authorization` header to be set

#### Response
```
{
  "roles": [
    {
      "id": 1,
      "title": "Admin",
      "createdAt": "2016-12-06T09:25:29.316Z",
      "updatedAt": "2016-12-06T09:25:29.316Z"
    },
    {
      "id": 1,
      "title": "Regular",
      "createdAt": "2016-13-06T09:25:29.316Z",
      "updatedAt": "2016-13-06T09:25:29.316Z"
    }
  ]
}
```

DOCUMENTS
---------
## Create Document
#### Request
  - Endpoint **POST** `/documents`
  - Requires `Authorization` header to be set
```
{
  "title": "Marvel",
  "content": "Diary of a movie addict",
  "access": "role"
}
```
#### Response
  - Body `(application/json)`
```
{
  "done": true,
  "doc": {
    "title": "Marvel",
    "content": "Diary of a movie addict",
    "access": "role",
    "createdAt": "2016-13-06T09:25:29.316Z",
    "updatedAt": "2016-13-06T09:25:29.316Z"
  }
}
```
## Get Document
#### Request
  - Endpoint **GET** `/documents`
  - Optional queries **page** (for the page number) && **limit** (number of documents per page)
  - Requires `Authorization` header to be set

#### Response
```
[
  {
    "title": "Marvel",
    "content": "Diary of a movie addict",
    "access": "role",
    "ownerId": "1",
    "createdAt": "2016-13-06T09:25:29.316Z",
    "updatedAt": "2016-13-06T09:25:29.316Z"
  },
  {
    "title": "The accountant",
    "content": "J.K simmons was in the movie as well as Ben Affleck, one of my fav",
    "access": "private",
    "ownerId": "2",
    "createdAt": "2016-13-06T09:25:29.316Z",
    "updatedAt": "2016-13-06T09:25:29.316Z"
  }
]
```

## Get A Document
#### Request
  - Endpoint **GET** `/documents/:id` where id is the id of the document
  - Requires `Authorization` header to be set

##### Response
```
{
  "title": "Marvel",
  "content": "Diary of a movie addict",
  "access": "role",
  "ownerId": "1",
  "createdAt": "2016-13-06T09:25:29.316Z",
  "updatedAt": "2016-13-06T09:25:29.316Z"
}
```

## Get Documents By User
#### Request
  - Endpoint **GET** `/users/:id/documents/` id is the id of the user
  - Requires `Authorization` header to be set
#### Response
```
[
  {
    "title": "The accountant",
    "content": "J.K simmons was in the movie as well as Ben Affleck, one of my fav",
    "access": "private",
    "ownerId": "1",
    "createdAt": "2016-13-06T09:25:29.316Z",
    "updatedAt": "2016-13-06T09:25:29.316Z"
  }
]
```

## Update Document
#### Request
  - Endpoint **PUT** `/documents/:id` id is the id of the document
  - Requires `Authorization` header to be set
```
{
  "title": "The accountant",
  "content": "J.K simmons was in the movie as well as Ben Affleck, one of my fav",
  "access": "private",
  "ownerId": "2",
}
```

## Delete Document
#### Request
  - Endpoint **DELETE** `/documents/:id`id of the document
  - Requires `Authorization` header to be set
#### Response
```
{
  "done": true
}
```
