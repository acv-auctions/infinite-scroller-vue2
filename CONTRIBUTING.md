# How to contribute

First of all, thank you for taking the time to contribute to this project. We've tried to make a stable project and try to fix bugs and add new features continuously. You can help us do more.

## Getting started

### Write some code

Contributing to a project on Github is pretty straight forward. If this is your first time, these are the steps you should take.

- Fork this repo.

And that's it! Read the code available and change the part you don't like! Your change should not break the existing code and should pass the tests.

If you're adding a new functionality, start from the branch **main**. It would be a better practice to create a new branch and work in there.

When you're done, submit a pull request and for one of the maintainers to check it out. We would let you know if there are any problems or any changes that should be considered.

### Tests

We've written tests and you can run them to assure the stability of the code, just try:

```sh
npm run test
```

If you're adding a new functionality please write a test for it. You can see the code coverage by running the following in the root of the repository:

```sh
npm run test:coverage
```

### Documentation

Every chunk of code that may be hard to understand has some comments above it. If you write some new code or change some part of the existing code in a way that it would not be functional without changing it's usages, it needs to be documented.