# jenkins-docker-pipeline

**Task 2 – Create a Simple Jenkins Pipeline for CI/CD (Jenkins + Docker)**

A small Node.js web app with a `Jenkinsfile` that automatically **tests, builds and deploys** it as a Docker container every time new code is committed to GitHub. Jenkins itself runs in Docker, so everything can be started with one command.

## Pipeline flow

```
git push -> Jenkins detects the commit -> Test -> Build -> Deploy -> Verify
```

| Stage | What it does |
| --- | --- |
| **Test** | Builds the Dockerfile's `test` stage, which runs `npm test`. If a test fails, the pipeline stops. |
| **Build** | Builds the small production image, tagged with the Jenkins build number and `latest`. |
| **Deploy** | Removes the old container and starts the new one on port 8080. |
| **Verify** | Waits until the container's Docker health check reports `healthy`; otherwise prints logs and fails. |

## Project structure

```
.
├── Jenkinsfile            # the pipeline (declarative)
├── Dockerfile             # multi-stage: test -> production
├── docker-compose.yml     # starts Jenkins locally
├── jenkins/Dockerfile     # Jenkins image + Docker CLI
├── src/                   # Node.js app
├── test/                  # unit tests
├── docs/interview-notes.md
└── screenshots/           # proof of the pipeline running
```

## How to run it

### Prerequisites
Docker (with Docker Compose), Git, and a GitHub account.

### 1. Put the project on GitHub
```bash
git init
git add .
git commit -m "Task 2: Jenkins pipeline"
git branch -M main
git remote add origin https://github.com/<your-username>/jenkins-docker-pipeline.git
git push -u origin main
```
Keep the repo **public** so Jenkins can clone it without credentials.

### 2. Start Jenkins
```bash
docker compose up -d --build
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```
Open <http://localhost:8080>, paste the password, choose **Install suggested plugins**, and create an admin user.

### 3. Create the pipeline job
1. **New Item** -> name it `jenkins-docker-pipeline` -> choose **Pipeline** -> OK.
2. Under **Pipeline**, set **Definition** to **Pipeline script from SCM**.
3. **SCM:** Git, **Repository URL:** your GitHub repo URL, **Branch:** `*/main`, **Script Path:** `Jenkinsfile`.
4. Save, then click **Build Now**.

### 4. Check the result
- Watch the stages go green in the Jenkins **Stage View**.
- Open <http://localhost:8080>: you should see "Deployed by Jenkins!" with the build number. `/health` and `/version` also work.

### 5. Test the automatic trigger
The `Jenkinsfile` contains `pollSCM('H/2 * * * *')`, so Jenkins checks GitHub about every 2 minutes (the trigger is registered after the first successful run).

1. Edit the heading in `src/app.js` (and the matching test in `test/app.test.js`).
2. `git commit -am "Change heading" && git push`
3. Within ~2 minutes a new build starts on its own. Refresh <http://localhost:8080> to see the new build number.

To see a failure, break a test on purpose and push: the **Test** stage turns red and nothing is deployed.

**Optional – instant trigger with a webhook:** expose Jenkins with a tunnel (for example `ngrok http 8080`), add `https://<tunnel-url>/github-webhook/` under the repo's **Settings -> Webhooks**, and tick **GitHub hook trigger for GITScm polling** in the job.

## Run the app without Jenkins
```bash
npm test
npm start                              # http://localhost:8080

docker build --target production -t jenkins-demo-app .
docker run -p 8080:8080 jenkins-demo-app
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `permission denied ... /var/run/docker.sock` | Keep `user: root` in `docker-compose.yml` (local learning setup) and recreate: `docker compose up -d --force-recreate`. |
| `docker: not found` in a stage | Rebuild the Jenkins image: `docker compose up -d --build`. |
| `port is already allocated` on 8080 | Stop whatever uses port 8080, or change `HOST_PORT` in the `Jenkinsfile`. |
| Jenkins cannot clone the repo | Make the repo public, or add GitHub credentials in Jenkins and select them in the job. |
| Docker Desktop on Windows/Mac | Make sure Docker Desktop is running; the socket mount in the compose file works there too. |

> The Docker socket is mounted into Jenkins so it can build and run containers. This is fine for a local demo, but not a production setup.

## Screenshots

See `screenshots/` for: the Jenkins Stage View with all stages green, the Console Output, the deployed app in the browser, and a second build triggered automatically by a commit.

## What I learned

- A `Jenkinsfile` stores the whole pipeline as code in the repo.
- How stages (Test -> Build -> Deploy -> Verify) give fast feedback and stop bad code from being deployed.
- How Jenkins can run Docker commands through the host's Docker socket.
- How polling (or a webhook) triggers a build on every commit.
