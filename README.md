#Package example to be shared between several Angular 2 Apps

## Update this package to NPM
Prerequisit :
- in the console, ensure your are log with your NPM account

1- Commit and push your change
2- npm version [Patch | minor | major]
3- npm publish

## Update this package - Development mode
using the npm link feature, in your Angular 2 projet, it's possible to point to this project directly, without publishing each time you do a modification.

**Setup the link**

Run an console application with elevated priviledge
In your NG2 Application folder, type : npm link [path to this projet]    ex. npm link ../test-ng2-service-shared

**Ensure this project is compile as you change it**

In this project :

npm rum watch

In the NG2 Project :

regular build process