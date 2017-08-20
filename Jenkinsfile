pipeline {
  agent any
  stages {
    stage('Prepare') {
      steps {
        sh '''echo 'What is the package'?
ls -la'''
        git(url: 'git@github.com:jasonherndon/open-west-skill.git', branch: 'master', changelog: true, poll: true)
        sh '''echo 'What is it now?"
ls -la'''
      }
    }
    stage('Build') {
      steps {
        sh 'echo \'This is the build\''
      }
    }
    stage('Test') {
      steps {
        sh 'echo \'This is the test\''
      }
    }
    stage('Deploy') {
      steps {
        sh 'echo \'This is the deploy\''
      }
    }
    stage('Notify') {
      steps {
        sh 'echo \'This is the notify\''
      }
    }
  }
}