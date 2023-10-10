# FRINDS_API

This is a Node.js API that provides functionality for managing users, blogs and comments, and determining the friend network of a user. The backend was created using the Express.js server and the Prisma ORM. `sqlite` is currently being used as the database which can easily be migrated to any other database such as MongoDB, Postgres, etc.

The objective is to create a backend API with User, Blog and Comment models. A Blog is created by a User and any User can create a Comment on any blog.

## Requirements

To run this API, you will need the following installed:

1. Node.js
2. NPM (Node Package Manager)
3. A database management system (MySQL, Postgres, etc.)
4. Prisma ORM
5. Express JS

## Getting started

1. Clone this repository: `git clone https://github.com/<username>/<repo-name>.git`
2. Navigate to the project directory: `cd <repo-name>`
3. Install dependencies: `npm install`
4. Run database migrations: `npx prisma migrate dev`
5. Seed the database: `npm run seed`
6. Start the server: `npm start`

## API Endpoints

The API endpoints are listed below which can be called using Postman:

A friend is 2nd level friend if they have commented on a blog where a 1st
level friend has also commented but has not commented on any common
blog.

Example - Blog1 has the comment of {User1, User2}, Blog2 has the
comment of {User1, User3}. Here User2 and User3 are 2nd level friends if
there exists no blog which has the comment of User2 and User3.Similar to above there can be third level friend and k-th level friends (
LinkedIn shows this kind of friend level).

### Users

1. `GET /users`: This endpoint retrieves a list of all users in the database.
2. `POST /users`: This endpoint creates a new user. Required parameters in the request body are _name_, _email_, and _password_.

### Blogs

1. `GET /blogs`: This endpoint retrieves a list of all blogs in the database.
2. `POST /blogs`: This endpoint creates a new blog. Required parameters in the request body are _title_, _content_, and _authorId_.

### Comments

1. `GET /comments`: Get all comments
2. `POST /comments`: Create a new comment
   Required parameters in the request body:

-   **authorId**: ID of the user who created the comment
-   **blogId**: ID of the blog on which the comment was made
-   **content**: Content of the comment

### Friends at a Level

1. `GET /users/:userId/friends/:level` - The **:userId** parameter should be replaced with the ID of the user for which the level friends are to be retrieved. The **:level** parameter should be replaced with the level number for which the friends are to be retrieved.
