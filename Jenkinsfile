pipeline{
    agent any
    parameters {
      choice(
        name:"BUMP", 
        choices:['patch', 'minor', 'major'], 
        desciption:"Version dump type (webhook builds use patch)"
      )
    }

    environment{
      // PORT where Nexus is listening for docker images upload
      REGISTRY:"localhost:8084"
      IMAGE: "${REGISTRY}/market-flow-app"
      GITHUB_REPO = 'github.com/Hamza7800/market-flow.git'
    }

    stages{
        stage("Bump version"){
            steps{
                echo "========Bumping Version========"
                sh '''
                  docker run --rm -i -e BUMP node:24.13.0-slim sh -c '
                    cd /tmp && cat > package.json &&
                    npm version "${BUMP:-patch}" --no-git-tag-version >/dev/null &&
                    cat package.json' < package.json > package.json.new
                  mv package.json.new package.json
                '''
                env.VERSION = sh(returnStdout: true,
                  script: '''grep -m1 '"version"' package.json | cut -d'"' -f4''').trim()
                currentBuild.displayName = "#${BUILD_NUMBER} v${env.VERSION}"
            }
            post{
                always{
                    echo "========BUMP VERSION========"
                }
                success{
                    echo "========Version BUMP successfully========"
                }
                failure{
                    echo "========Version BUMP failed========"
                }
            }
        }
        stage("Build Image"){
            steps{
              echo 'building the docker image...'
              sh '''
                docker build \
                  --label org.opencontainers.image.version="$VERSION" \
                  --label org.opencontainer.image.revision="$(git rev-parse HEAD)" \
                  -t "$IMAGE:$VERSION" .
              '''
            }
          post{
            always{
                echo "========IMAGE BUILD========"
            }
            success{
                echo "========IMAGE BUILD successfully========"
            }
            failure{
                echo "========IMAGE BUILD failed========"
            }
          }
        }
        stage("Push to nexus"){
          steps {
            withCredentials(
              [usernamePassword(credentialsId:"nexus-creds",passwordVariable:"NEXUS_PASS", usernameVariable:"NEXUS_USER")]
            ){
                echo "Logging into Nexus..."
                sh '''
                  echo "$NEXUS_PASS" | docker login "$REGISTRY" -u "$NEXUS_USER" --password-stdin
                  trap 'docker logout "$REGISTRY"' EXIT
                  docker push "$IMAGE:$VERSION"
                '''
            }
          }
        }
        stage("Commit version and tag"){
          steps{
           withCredentials([usernamePassword(credentialsId: 'github-credentials',
              usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
              sh '''
                git config user.name "jenkins-bot"
                git config user.email "jenkins-bot@users.noreply.github.com"
                git add package.json
                git commit -m "chore(release): v$VERSION [ci skip]"
                git tag -d "v$VERSION" 2>/dev/null || true
                git tag -a "v$VERSION" -m "Release v$VERSION"
                git push "https://$GH_USER:$GH_TOKEN@$GITHUB_REPO" HEAD:main "refs/tags/v$VERSION"
              '''
              }
          }
        }
    }
    post{
      always  { sh 'docker image prune -f || true' }
      success { echo '======== pipeline executed successfully ========' }
      failure { echo '======== pipeline execution failed ========' }
    }
}