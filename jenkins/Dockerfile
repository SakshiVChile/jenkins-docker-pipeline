# Jenkins with the Docker CLI so pipelines can run "docker build / docker run"
FROM jenkins/jenkins:lts-jdk17

USER root
COPY --from=docker:27-cli /usr/local/bin/docker /usr/local/bin/docker
USER jenkins
