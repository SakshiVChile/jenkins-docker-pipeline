# Interview notes – Task 2 (study notes, put them in your own words)

**1. What is Jenkins, and how is it used in CI/CD?**
Jenkins is an open-source automation server. It watches a code repository and, on every change, runs the steps to test, build and deploy the application, so releases are fast and repeatable.

**2. What is a Jenkinsfile?**
A text file in the repository that defines the pipeline as code (stages and steps). Because it lives with the code, it is versioned, reviewed and reused like any other file.

**3. How do you create and configure a Jenkins pipeline?**
Install Jenkins, create a *Pipeline* job, point it at the Git repo ("Pipeline script from SCM"), set the branch and the Jenkinsfile path, configure a trigger (webhook or poll SCM), then run it and read the console output.

**4. Common stages in a pipeline**
Checkout, Build, Test, Package or build a Docker image, Push to a registry, Deploy, Verify (smoke test or health check), Notify.

**5. Declarative vs scripted pipeline**
Declarative uses a fixed, structured syntax (`pipeline { agent ... stages { ... } }`). It is easier to read and validates early. Scripted is plain Groovy inside `node { }`, which is more flexible but easier to get wrong. Declarative is the recommended default.

**Bonus – what this project's pipeline does**
It runs the tests inside Docker, builds a production image tagged with the build number, replaces the running container, and confirms it is healthy before calling the build a success.
